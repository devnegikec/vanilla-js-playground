const STATE = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
}
class MyPromise {
    #thenCbs = [];
    #catchCbs = [];
    #state = STATE.PENDING;
    #vlaue = null;
    #onSuccessBinded = this.#onSuccess.bind(this);
    #onFailBinded = this.#onFail.bind(this);
    constructor(cb) {
        try {
            cb(this.#onSuccessBinded, this.#onFailBinded);
        } catch (e) {
            this.#onFail(e);
        }
    }

    #runCallbacks() {
        if(this.#state === STATE.FULFILLED) {
            this.#thenCbs.forEach(cb => {
                cb(this.#vlaue);
            })
            this.#thenCbs = []; // once fulfilled, clear the callbacks
        }

        if (this.#state === STATE.REJECTED) {
            this.#catchCbs.forEach(cb => {
                cb(this.#vlaue);
            })
            this.#catchCbs = []; // once rejected, clear the callbacks
        }
    }

    #onSuccess(value) {
        queueMicrotask(() => {
            if (this.#state !== STATE.PENDING) return;

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBinded, this.#onFailBinded);
                return;
            }
            this.#vlaue = value;
            this.#state = STATE.FULFILLED;
            this.#runCallbacks();
        });
    }

    #onFail(value) {
        queueMicrotask(() => {
            if (this.#state !== STATE.PENDING) return;

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBinded, this.#onFailBinded);
                return;
            }

            if (this.#catchCbs.length === 0) {
                throw new UncaughtPromiseError(value);
            }

            this.#vlaue = value;
            this.#state = STATE.REJECTED;
            this.#runCallbacks();
        });
    }

    then(thenCb, catchCb) {
        return new MyPromise((resolve, reject) => {
            this.#thenCbs.push((result => {
                if (thenCb == null) {
                    resolve(result);
                    return;
                }

                try {
                    resolve(thenCb(result));
                } catch (e) {
                    reject(e);
                }
            }))

            this.#catchCbs.push((result => {
                if (catchCb == null) {
                    reject(result);
                    return;
                }

                try {
                    resolve(catchCb(result));
                } catch (e) {
                    reject(e);
                }
            }))

            if (thenCb != null) {
                this.#thenCbs.push(thenCb);
            }
            if (catchCb) {
                this.#catchCbs.push(catchCb);
            }
            this.#runCallbacks();
        });
    }
    catch(cb) {
        this.then(null, cb);
    }
    finally(cb) {
        return this.then(
            (result) => {
                cb();
                return result;
            },
            (error) => {
                cb();
                throw error;
            }
        );
    }

    static resolve(value) {
        return new MyPromise((resolve) => resolve(value));
    }

    static reject(value) {
        return new MyPromise((_, reject) => reject(value));
    }

    static all(promises) {
        const results = []
        let completedPromises = 0
        return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            promise
            .then(value => {
                completedPromises++
                results[i] = value
                if (completedPromises === promises.length) {
                resolve(results)
                }
            })
            .catch(reject)
        }
        })
  }

  static allSettled(promises) {
    const results = []
    let completedPromises = 0
    return new MyPromise(resolve => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise
          .then(value => {
            results[i] = { status: STATE.FULFILLED, value }
          })
          .catch(reason => {
            results[i] = { status: STATE.REJECTED, reason }
          })
          .finally(() => {
            completedPromises++
            if (completedPromises === promises.length) {
              resolve(results)
            }
          })
      }
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve).catch(reject)
      })
    })
  }

  static any(promises) {
    const errors = []
    let rejectedPromises = 0
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise.then(resolve).catch(value => {
          rejectedPromises++
          errors[i] = value
          if (rejectedPromises === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"))
          }
        })
      }
    })
  }

  
}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error)

    this.stack = `(in promise) ${error.stack}`
  }
}

export default MyPromise;






