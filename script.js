const constellation = document.getElementById("constellation");
const qamTypeSelect = document.getElementById("qamType");
const noiseLevelInput = document.getElementById("noiseLevel");
const signalChartCtx = document.getElementById("signalChart").getContext("2d");
const size = 400;
let signalChart;

function generatePoints(qamType) {
  let points = [];
  if (qamType === 32) {
    // Custom 32-QAM constellation (approximate)
    points = [
      { x: -3, y: -3 },
      { x: -1, y: -3 },
      { x: 1, y: -3 },
      { x: 3, y: -3 },
      { x: -3, y: -1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 3, y: -1 },
      { x: -3, y: 1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: -3, y: 3 },
      { x: -1, y: 3 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: -2, y: -2 },
      { x: 0, y: -2 },
      { x: 2, y: -2 },
      { x: -2, y: 0 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -2, y: 2 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
      { x: -1.5, y: -1.5 },
      { x: 1.5, y: -1.5 },
      { x: -1.5, y: 1.5 },
      { x: 1.5, y: 1.5 },
      { x: 0, y: -1.5 },
      { x: 0, y: 1.5 },
    ];
    // Normalize points to fit in the range [-1, 1]
    points = points.map((point) => ({ x: point.x / 3, y: point.y / 3 }));
  } else {
    let gridSize = Math.sqrt(qamType);
    let step = 2 / (gridSize - 1);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        points.push({ x: -1 + i * step, y: -1 + j * step });
      }
    }
  }
  return points;
}

function addNoise(point, noiseLevel) {
  const noiseX = (Math.random() - 0.5) * noiseLevel;
  const noiseY = (Math.random() - 0.5) * noiseLevel;
  return { x: point.x + noiseX, y: point.y + noiseY };
}

function drawConstellation(qamType, noiseLevel) {
  constellation.innerHTML = "";
  const points = generatePoints(qamType);

  points.forEach((point) => {
    const div = document.createElement("div");
    div.classList.add("point");
    div.style.left = `${(point.x + 1) * (size / 2) - 5}px`;
    div.style.top = `${(1 - point.y) * (size / 2) - 5}px`;
    constellation.appendChild(div);

    const noisyPoint = addNoise(point, noiseLevel / 100);
    const noiseDiv = document.createElement("div");
    noiseDiv.classList.add("noise-point");
    noiseDiv.style.left = `${(noisyPoint.x + 1) * (size / 2) - 5}px`;
    noiseDiv.style.top = `${(1 - noisyPoint.y) * (size / 2) - 5}px`;
    constellation.appendChild(noiseDiv);
  });

  drawSignalChart(points, noiseLevel);
}

function drawSignalChart(points, noiseLevel) {
  const samplesPerSymbol = 100;
  const sampleRate = points.length * samplesPerSymbol;
  const signalDataI = [];
  const signalDataQ = [];
  const timeData = [];

  points.forEach((point) => {
    for (let i = 0; i < samplesPerSymbol; i++) {
      let t = i / samplesPerSymbol;
      let noisyPoint = addNoise(point, noiseLevel / 100);
      signalDataI.push(noisyPoint.x * Math.cos(2 * Math.PI * t));
      signalDataQ.push(noisyPoint.y * Math.sin(2 * Math.PI * t));
      timeData.push(t + points.indexOf(point));
    }
  });

  const chartDataI = {
    labels: timeData,
    datasets: [
      {
        label: "Componente I",
        data: signalDataI,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  const chartDataQ = {
    labels: timeData,
    datasets: [
      {
        label: "Componente Q",
        data: signalDataQ,
        borderColor: "rgba(192, 75, 75, 1)",
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  if (signalChart) {
    signalChart.destroy();
  }

  signalChart = new Chart(signalChartCtx, {
    type: "line",
    data: {
      labels: timeData,
      datasets: [
        {
          label: "Componente I",
          data: signalDataI,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: "Componente Q",
          data: signalDataQ,
          borderColor: "rgba(192, 75, 75, 1)",
          borderWidth: 1,
          fill: false,
          pointRadius: 0,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Tiempo",
          },
        },
        y: {
          title: {
            display: true,
            text: "Amplitud",
          },
        },
      },
    },
  });
}

qamTypeSelect.addEventListener("change", () => {
  drawConstellation(
    parseInt(qamTypeSelect.value),
    parseInt(noiseLevelInput.value)
  );
});

noiseLevelInput.addEventListener("input", () => {
  drawConstellation(
    parseInt(qamTypeSelect.value),
    parseInt(noiseLevelInput.value)
  );
});

drawConstellation(16, 0);
