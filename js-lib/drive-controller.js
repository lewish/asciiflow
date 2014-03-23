/** @const */
var CLIENT_ID = '125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com';
/** @const */
var SCOPES = 'https://www.googleapis.com/auth/drive';
/** @const */
var DEVELOPER_KEY = 'AIzaSyBbKO_v9p-G9StQjYmtUYLP6Px4MkGions';

/**
 * 
 * @constructor
 */
ascii.DriveController = function(state) {
  /** @type {boolean} */
  this.driveEnabled = false;
  /** @type {ascii.State} */
  this.state = state;
  // This is a file resource, as defined by the Drive API.
  /** @type {Object} */
  this.file = null;

  this.tryInitialAuth();

  $('#save-button').click(function(e) {
      this.save();
  }.bind(this));

  $('#drive-button').click(function() {
    if (!this.driveEnabled) {
      // Haven't been able to immediately auth yet, so try full auth.
      this.checkAuth(false);
      this.waitForFullAuth();
    } else {
      this.loadDialog();
    }
  }.bind(this));
};

/**
 * Check if the current user has authorized the application.
 */
ascii.DriveController.prototype.checkAuth = function(immediate) {
  window['gapi']['auth']['authorize']({
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': immediate},
      function(result) {
        if (result && !result.error) {
          this.driveEnabled = true;
          $('#drive-button').addClass('active');
        }
      }.bind(this));
};

ascii.DriveController.prototype.tryInitialAuth = function() {
  if (window['gapi'] && window['gapi']['auth'] && window['gapi']['auth']['authorize']) {
    this.checkAuth(true);
  } else {
    window.setTimeout(function() {
      this.tryInitialAuth();
    }.bind(this), 2000);
  }
};

ascii.DriveController.prototype.waitForFullAuth = function() {
  window.setTimeout(function() {
    if (!this.driveEnabled) {
      this.checkAuth(true);
      this.waitForFullAuth();
    } else {
      this.loadDialog();
    }
  }.bind(this), 2000);
};

/**
 * Handles a file resource being returned from Drive.
 */
ascii.DriveController.prototype.handleFile = function(file) {
  this.file = file;
  $('#drive-filename').text(file['title']);
  $('#drive-filename')['editable'](function(value, settings) {
      this.file['title'] = value;
      this.save();
      // Remove the event handler.
      $('#drive-filename').off();
      return value;
    }.bind(this),
    { 
      type    : 'text',
      submit  : 'OK',
    });
};


/**
 * Loads the drive dialog.
 */
ascii.DriveController.prototype.loadDialog = function() {
  $('#drive-dialog').addClass('visible');
};

/**
 * Saves the current diagram to drive.
 */
ascii.DriveController.prototype.save = function() {
  this.getSaveRequest().execute(function(result) {
    this.handleFile(result);
  }.bind(this));
};

ascii.DriveController.prototype.getSaveRequest = function() {
  var text = this.state.outputText();

  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";

  var title = this.file == null ? 'Untitled ASCII Diagram' : this.file['title'];

  var metadata = {
      'title': title,
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

  // Choose upload path and method depending on whether we have create a file already.
  var fileId = this.file == null ? '' : '/' + this.file['id'];
  var method = this.file == null ? 'POST' : 'PUT';

  return window['gapi']['client']['request']({
      'path': '/upload/drive/v2/files' + fileId,
      'method': method,
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
};
