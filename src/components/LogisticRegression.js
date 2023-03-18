import * as math from "mathjs";
import Papa from "papaparse";

const eta = 0.000000001;
const training_steps = 1000000;
const TRAINFILE = process.env.PUBLIC_URL + "/weather-train3.csv";
const PREDICT_FILE = process.env.PUBLIC_URL + "/weather-predict3.csv";

function loadData(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      download: true,
      dynamicTyping: true,
      header: false,
      complete: (results) => {
        resolve(results.data);
      },
    });
  });
}

function sigmoid(x) {
  if (x >= 0) {
    return 1 / (1 + Math.exp(-x));
  } else {
    return Math.exp(x) / (1 + Math.exp(x));
  }
}

function parseCsv(csv) {
    return Papa.parse(csv, {
      header: false,
      dynamicTyping: true,
    }).data;
}
  
function dotProduct(a, b) {
    return a.reduce((sum, item, i) => sum + item * b[i], 0);
}

async function train(training_data, past_dates) {
    const training_data_with_ones_dense = math.concat(
      math.ones(training_data.length, 1),
      training_data
    );
    console.log("training_data_with_ones_dense:", training_data_with_ones_dense)
    const training_data_with_ones = training_data_with_ones_dense.toArray();
    const headers1 = training_data_with_ones[0];
    console.log("Headers1:", headers1);

    const headers = training_data_with_ones[0].slice(0, -1);
    console.log("Headers:", headers);
    
    const datapoints = training_data_with_ones.length - 1;
    console.log("Datapoints:", datapoints);
    
    const transposed_data = math.transpose(training_data_with_ones);
    const feature_data = transposed_data.slice(0, -1).map(row => row.slice(1));
    const x_values = math.transpose(feature_data);
    const training_dates = training_data_with_ones.slice(1).map((row) => row.slice(-1)[0]);
    const y_values = math.reshape(training_dates.map((date) => (past_dates.includes(date) ? 1 : 0)), [90, 1]);

    console.log("X_values:", x_values);
    console.log("y_values:", y_values);
    console.log("training dates:", training_dates);
  
    const m = headers.length;
  
    let thetas = math.zeros(m, 1);
    console.log("Unintialized_thetas:", thetas)
    for (let training_step = 0; training_step < training_steps; training_step++) {
    // Calculating the weighted sum for all datapoints using matrix multiplication
        const weighted_sum = math.multiply(x_values, thetas);

    // Computing the difference between the predicted values and the actual values
        const diff = math.subtract(y_values, math.map(weighted_sum, sigmoid));
    // Calculating the gradients using matrix multiplication
        const gradients = math.multiply(math.transpose(x_values), diff);

    // Updating thetas using the gradients and learning rate
        thetas = math.add(thetas, math.multiply(eta, gradients));
      }
    
      return thetas;
    }
async function predict(pastDates) {
    console.log("Past dates:", pastDates);
    const training_data = await loadData(TRAINFILE);
    const thetas = await train(training_data, pastDates);
    console.log("Thetas:", thetas);
    const predictFileContent = await fetch(PREDICT_FILE);
    const predictCsv = await predictFileContent.text();
    const predictData = parseCsv(predictCsv);
    console.log("predictData:", predictData);

    const predict_data_with_ones_dense = math.concat(
      math.ones(predictData.length, 1),
      predictData
    );
    console.log("predict_data_with_ones_dense:", predict_data_with_ones_dense)
    const predict_data_with_ones = predict_data_with_ones_dense.toArray();

    const headers = predict_data_with_ones[0].slice(0, -1);
    console.log("Headers_predict:", headers);

    const transposed_data = math.transpose(predict_data_with_ones);
    const feature_data = transposed_data.slice(0, -1).map(row => row.slice(1));
    const x_values = math.transpose(feature_data);

    const datesList = predictData.slice(1).map(row => row[row.length - 1]);
    console.log("x_values_predict:", x_values);
    console.log("datesList:", datesList);
    const datapoints = x_values.length;
    console.log("datapoints:", datapoints);
    const predictions = {};
      
    for (let i = 0; i < datapoints; i++) {
        const x_i = x_values[i].map(item => parseFloat(item));
        const weightedSum = dotProduct(x_i, thetas.toArray().map(item => item[0]));
        const prob = sigmoid(weightedSum);
        console.log(weightedSum,prob, datesList[i])
        if (prob >= 0.2) {
            console.log("True:", datesList[i])
            predictions[datesList[i]] = prob;
        }
        else {
            console.log("False:", datesList[i])
        }
    }
    // return the dates that have the highest probability of migraine onset
    const sortedDates = Object.entries(predictions).sort((a, b) => b[1] - a[1]);
    const topDates = sortedDates.slice(0, Math.min(10, sortedDates.length)).map(([date, prob]) => date);
    return topDates;
}

export {predict};