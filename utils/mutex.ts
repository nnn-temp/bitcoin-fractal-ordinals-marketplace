import { flagMutex, iterator } from "..";
import app from "..";

export const setUtxoFlag = async (value: number) => {
  const release = await flagMutex.acquire();
  try {
    // Perform actions with the flag variable
    app.locals.utxoflag = value;
  } finally {
    release();
  }
};

export async function waitUtxoFlag() {
  return new Promise<void>((resolve, reject) => {
    let intervalId: any;
    const checkForUtxo = async () => {
      try {
        if (!app.locals.utxoflag) {
          resolve();
          clearInterval(intervalId);
        }
      } catch (error) {
        reject(error);
        clearInterval(intervalId);
      }
    };
    intervalId = setInterval(checkForUtxo, 200);
  });
}

export const setApiIterator = async (value: number) => {
  const release = await iterator.acquire();
  try {
    // Perform actions with the flag variable
    app.locals.iterator = value;
  } finally {
    release();
  }
};
