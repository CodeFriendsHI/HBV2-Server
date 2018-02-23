import { resolve } from "path";

const streams = [
  {
    id: 0,
    img: 'Skeletor.png',
  },
  {
    id: 1,
    img: 'dabbi.jpg',
  },
  {
    id: 2,
    img: 'simmi.jpg',
  },
  {
    id: 3,
    img: 'steingrimur.jpg',
  },
  {
    id: 4,
    img: 'kata.jpg',
  },
];

exports.findById = id => new Promise((resolve) => {
  const found = streams.find(s => s.id === id);
  if (found) {
    return resolve(found);
  }

  return resolve(null);
});