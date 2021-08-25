export default class ErrorService {
  constructor() {
    this.initHandler()
  }

  static initHandler() {
    const scope = this
    window.onerror = (message, url, lineNo, columnNo, error) => {
      if (error) {
        scope.onError(error)
        console.log(message, url, lineNo, columnNo, error)
      }
    }
  }

  static onError(error) {
    // for (var key in error) {
    //   console.log(key + ' => ' + error[key])
    //   if (typeof error[key] === 'object') {
    //     for (var k in error[key]) {
    //       if (typeof error[key][k] !== 'function') {
    //         console.log(key + ':' + k + ' => ' + error[key][k])
    //       }
    //     }
    //   }
    // }
    const response = error.response
    if (response && response.status >= 400 && response.status < 405) {
      // You can handle this differently
      ErrorService.sentryLogEngine(error)
      return false
    }
    // Send Error to Log Engine e.g LogRocket
    ErrorService.logRocketLogEngine(error)
  }

  static onWarn(error) {
    // Send Error to Log Engine e.g LogRocket
    this.logRocketLogEngine(error)
  }

  static onInfo(error) {
    // You can handle this differently
    this.sentryLogEngine(error)
  }

  static onDebug(error) {
    const response = error.response
    if (response && response.status >= 400 && response.status < 405) {
      // You can handle this differently
      this.sentryLogEngine(error)
      return false
    }
    // Send Error to Log Engine e.g LogRocket
    this.logRocketLogEngine(error)
  }



  static displayErrorAlert(message) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error'
    })
  }

  static logRocketLogEngine(error) {
    // Implement LogRocket Engine here
    console.log(error, 'LogRocket')
    ErrorService.displayErrorAlert(error)
  }

  static sentryLogEngine(error) {
    // Implement Sentry Engine here
    console.log(error, 'Sentry')
    ErrorService.displayErrorAlert(error)
  }
}
