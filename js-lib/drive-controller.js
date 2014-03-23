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
ascii.DriveController = function(state, view) {
  /** @type {boolean} */
  this.driveEnabled = false;
  /** @type {ascii.State} */
  this.state = state;
  /** @type {ascii.View} */
  this.view = view;
  // This is a file resource, as defined by the Drive API.
  /** @type {Object} */
  this.file = null;
  /** @type {string} */
  this.cachedContent = '';

  this.tryInitialAuth();

  $('#drive-button').click(function() {
    if (!this.driveEnabled) {
      // Haven't been able to immediately auth yet, so try full auth.
      this.checkAuth(false);
      this.waitForFullAuth();
    } else {
      this.loadDialog();
    }
  }.bind(this));

  $('#drive-filename').click(function() {
    var currentTitle = '' + $('#drive-filename').text();
    var title = prompt('Enter new filename:', currentTitle);
    this.file['title'] = title;
    this.save();
  }.bind(this));

  this.loopSave();
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
        if (result && !result.error && !this.driveEnabled) {
          this.driveEnabled = true;
          $('#drive-button').addClass('active');
          // We are authorized, so let's se if we can load from the URL hash.
          this.loadFromHash();
        }
      }.bind(this));
};

ascii.DriveController.prototype.tryInitialAuth = function() {
  if (window['gapi'] && window['gapi']['auth'] && window['gapi']['auth']['authorize']) {
    this.checkAuth(true);
  } else {
    window.setTimeout(function() {
      this.tryInitialAuth();
    }.bind(this), 500);
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
  }.bind(this), 1000);
};

/**
 * Handles a file resource being returned from Drive.
 */
ascii.DriveController.prototype.handleFile = function(file) {
  this.file = file;
  $('#drive-filename').text(file['title']);
  window.location.hash = file.id;
};


/**
 * Loads the drive dialog.
 */
ascii.DriveController.prototype.loadDialog = function() {
  $('#drive-dialog').addClass('visible');
  this.save();
};

/**
 * Repeatedly save the diagram if it is editable and loaded.
 */
ascii.DriveController.prototype.loopSave = function() {
  var text = this.state.outputText();
  if (text != this.cachedText && this.file && this.file['editable']) {
    this.cachedText = text;
    this.save();
  }
  window.setTimeout(function() {
    this.loopSave();
  }.bind(this), 5000);
}

/**
 * Saves the current diagram to drive.
 */
ascii.DriveController.prototype.save = function() {
  var text = this.state.outputText();
  $('#drive-save-state').text('Saving...');
  this.getSaveRequest(text).execute(function(result) {
    this.handleFile(result);
    $('#drive-save-state').text('Saved');
  }.bind(this));
};

ascii.DriveController.prototype.loadFromHash = function() {
  if (window.location.hash.length > 1) {
    $('#drive-save-state').text('Loading...');
    var fileId = window.location.hash.substr(1, window.location.hash.length - 1);
    this.getLoadRequest(fileId).execute(function(result) {
      this.handleFile(result);
      this.reloadFileContent();
    }.bind(this));
  }
};

ascii.DriveController.prototype.reloadFileContent = function() {
  this.downloadFile(this.file['downloadUrl'], function(content) {
    $('#drive-save-state').text('Loaded');
    this.state.clear();
    this.state.fromText(content, this.view.screenToCell(new ascii.Vector(
            this.view.canvas.width / 2,
            this.view.canvas.height / 2)));
  }.bind(this));
};

ascii.DriveController.prototype.getSaveRequest = function(text) {
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

ascii.DriveController.prototype.getLoadRequest = function(fileId) {
  return window['gapi']['client']['request']({
      'path': '/drive/v2/files/' + fileId,
      'method': 'GET'});
};

/**
 * Download a file's content.
 *
 * @param {string} url
 */
ascii.DriveController.prototype.downloadFile = function(url, callback) {
  var accessToken = window['gapi']['auth']['getToken']()['access_token'];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.onload = function() {
    callback(xhr.responseText);
  };
  xhr.onerror = function() {
    callback(null);
  };
  xhr.send();
}
