export default function reduceDailyTemps(temperature) {
  let temp = 0;
  temperature.forEach((element) => {
    if (temp < element) {
      temp = element;
    }
  });
  return temp;
}
