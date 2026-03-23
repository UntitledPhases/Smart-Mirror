#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

APT_UPDATED=0
SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

if [ "$(id -u)" -ne 0 ] && [ -z "$SUDO" ]; then
  echo "This script requires root privileges to install missing packages." >&2
  exit 1
fi

apt_update_if_needed() {
  if [ "$APT_UPDATED" -eq 0 ]; then
    log "Updating apt package index..."
    $SUDO apt-get update
    APT_UPDATED=1
  fi
}

ensure_package() {
  local pkg="$1"
  if dpkg -s "$pkg" >/dev/null 2>&1; then
    log "Package '$pkg' is already installed."
  else
    log "Installing package '$pkg'..."
    apt_update_if_needed
    $SUDO apt-get install -y "$pkg"
  fi
}

install_chromium() {
  local pkg
  local chromium_candidates=("chromium-browser" "chromium")
  for pkg in "${chromium_candidates[@]}"; do
    if dpkg -s "$pkg" >/dev/null 2>&1; then
      CHROMIUM_CMD="$(command -v "$pkg" || echo "/usr/bin/$pkg")"
      log "Using existing '$pkg' package for Chromium."
      return 0
    fi
  done

  for pkg in "${chromium_candidates[@]}"; do
    log "Attempting to install '$pkg'..."
    apt_update_if_needed
    if $SUDO apt-get install -y "$pkg"; then
      CHROMIUM_CMD="$(command -v "$pkg" || echo "/usr/bin/$pkg")"
      log "Installed '$pkg' for Chromium."
      return 0
    else
      log "Failed to install '$pkg'. Trying next option..."
    fi
  done

  echo "Unable to install Chromium browser. Please install 'chromium-browser' or 'chromium' manually." >&2
  exit 1
}

cleanup() {
  local exit_code=$?
  trap - EXIT
  if [[ -n "${CHROMIUM_PID:-}" ]]; then
    if kill -0 "$CHROMIUM_PID" >/dev/null 2>&1; then
      log "Stopping Chromium (PID $CHROMIUM_PID)..."
      kill "$CHROMIUM_PID" || true
    fi
  fi
  if [[ -n "${X_SESSION_PID:-}" ]]; then
    if kill -0 "$X_SESSION_PID" >/dev/null 2>&1; then
      log "Stopping X session (PID $X_SESSION_PID)..."
      kill "$X_SESSION_PID" || true
    fi
  fi
  if [[ -n "${VITE_PID:-}" ]]; then
    if kill -0 "$VITE_PID" >/dev/null 2>&1; then
      log "Stopping Vite server (PID $VITE_PID)..."
      kill -TERM "-$VITE_PID" >/dev/null 2>&1 || kill "$VITE_PID" >/dev/null 2>&1 || true
    fi
  fi
  wait || true
  exit "$exit_code"
}

wait_for_display() {
  local retries=30
  local delay=1
  for ((i = 0; i < retries; i++)); do
    if xset q >/dev/null 2>&1; then
      return 0
    fi
    if ! ps -p "$X_SESSION_PID" >/dev/null 2>&1; then
      return 1
    fi
    sleep "$delay"
  done
  return 1
}

main() {
  trap cleanup EXIT

  local packages=(
    xserver-xorg
    x11-xserver-utils
    xinit
    openbox
    nodejs
    npm
  )

  for pkg in "${packages[@]}"; do
    ensure_package "$pkg"
  done

  install_chromium

  local project_dir="$HOME/Smart-Mirror"
  if [ ! -d "$project_dir" ]; then
    echo "Project directory '$project_dir' not found." >&2
    exit 1
  fi
  if [ ! -f "$project_dir/package.json" ]; then
    echo "package.json not found in '$project_dir'." >&2
    exit 1
  fi

  cd "$project_dir"

  if [ ! -d "node_modules" ]; then
    log "Installing Node.js dependencies..."
    npm install
  else
    log "Node.js dependencies already installed."
  fi

  log "Starting Vite development server..."
  npm run dev -- --host 0.0.0.0 --port 5173 >"$project_dir/vite.log" 2>&1 &
  VITE_PID=$!
  log "Vite server started with PID $VITE_PID. Logs: $project_dir/vite.log"

  sleep 5

  log "Starting X session with Openbox..."
  startx /usr/bin/openbox-session -- :0 vt1 -nocursor >/dev/null 2>&1 &
  X_SESSION_PID=$!
  log "X session started with PID $X_SESSION_PID."

  export DISPLAY=:0
  export XAUTHORITY="$HOME/.Xauthority"

  if ! wait_for_display; then
    echo "Failed to initialize X server." >&2
    exit 1
  fi

  local chromium_flags=(
    --noerrdialogs
    --disable-infobars
    --no-proxy-server
    --kiosk
    --app=http://localhost:5000/mirror/
  )

  log "Launching Chromium (${CHROMIUM_CMD}) in kiosk mode..."
  "$CHROMIUM_CMD" "${chromium_flags[@]}" >/dev/null 2>&1 &
  CHROMIUM_PID=$!
  log "Chromium started with PID $CHROMIUM_PID."

  log "Waiting for Vite server (PID $VITE_PID) to exit..."
  wait "$VITE_PID"
  local vite_status=$?
  log "Vite server exited with status $vite_status."
  exit "$vite_status"
}

main "$@"
