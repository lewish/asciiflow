/** @const */
var CLIENT_ID = '125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com';
/** @const */
var SCOPES = 'https://www.googleapis.com/auth/drive';

/**
 * 
 * @constructor
 */
ascii.DriveController = function(state) {
  /** @type {ascii.State} */
  this.state = state;
  /** @type {Object} */
  this.file = null;
  // Let's just hope this happens before anyone clicks save/open.
  $('#save-button').click(function(e) {
      this.save();
  }.bind(this));
};

/**
 * Check if the current user has authorized the application.
 */
ascii.DriveController.prototype.checkAuth = function(callback) {
  window['gapi']['auth']['authorize']({
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': false},
      function(result) {
        if (result && !result.error) {
          callback(true);
        } else {
          window.alert(result.error);
          callback(false);
        }
      });
};

/**
 * Saves the current diagram to drive.
 */
ascii.DriveController.prototype.save = function() {
  window['gapi']['client']['load']('drive', 'v2', function() {
      this.checkAuth(function(authed) {
          if (authed) {
            this.getSaveRequest().execute(function(result) {
                window.console.log(result);
            });
          }
      }.bind(this))
  }.bind(this));
};

ascii.DriveController.prototype.getSaveRequest = function() {
  var text = this.state.outputText();

  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";

  var metadata = {
      'title': 'Untitled ASCII Diagram',
      'mimeType': 'text/plain'
  };

  var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + 'text/plain' + '\r\n' +
      '\r\n' +
      text +
      close_delim;

  return window['gapi']['client']['request']({
      'path': '/upload/drive/v2/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
};
