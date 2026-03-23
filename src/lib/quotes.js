const quotes = [
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "A man who dares to waste one hour of time has not discovered the value of life.", author: "Charles Darwin" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "You are what you do, not what you say you'll do.", author: "Carl Jung" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "He who has a why to live for can bear almost any how.", author: "Nietzsche" },
  { text: "The world breaks everyone, and afterward, some are strong at the broken places.", author: "Hemingway" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "If you don't sacrifice for what you want, what you want becomes the sacrifice.", author: "Unknown" },
  { text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.", author: "Seneca" },
  { text: "The struggle itself towards the heights is enough to fill a man's heart.", author: "Camus" },
  { text: "One must imagine Sisyphus happy.", author: "Camus" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Emerson" },
  { text: "A ship in harbor is safe, but that is not what ships are built for.", author: "John A. Shedd" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "Man cannot remake himself without suffering, for he is both the marble and the sculptor.", author: "Alexis Carrel" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Goethe" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
];

export function getQuoteOfDay() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return quotes[seed % quotes.length];
}
