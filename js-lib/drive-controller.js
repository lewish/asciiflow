import Vector from './vector';
import State from './state';
import View from './view';

const CLIENT_ID = '125643747010-9s9n1ne2fnnuh5v967licfkt83r4vba5.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive';
const DEVELOPER_KEY = 'AIzaSyBbKO_v9p-G9StQjYmtUYLP6Px4MkGions';

export default class DriveController {
  constructor(state, view) {
    /** @type {boolean} */
    this.driveEnabled = false;
    /** @type {State} */
    this.state = state;
    /** @type {View} */
    this.view = view;
    // This is a file resource, as defined by the Drive API.
    /** @type {Object} */
    this.file = null;
    /** @type {string} */
    this.cachedText = '';

    this.tryInitialAuth();

    $('#drive-button').click(() => {
      if (!this.driveEnabled) {
        // Haven't been able to immediately auth yet, so try full auth.
        this.checkAuth(false);
        this.waitForFullAuth();
      } else {
        this.loadDialog();
      }
    });

    $('#drive-filename').click(() => {
      var currentTitle = '' + $('#drive-filename').text();
      var title = prompt('Enter new filename:', currentTitle);
      this.file['title'] = title;
      this.save();
      this.loadFileList();
    });

    this.loopSave();

    $(window).on('hashchange', this.loadFromHash);

    $('#drive-new-file-button').click(() => {
      this.file = null;
      this.state.clear();
      window.location.hash = '';
      this.save();
      $('#drive-dialog').removeClass('visible');
    });
  }

  /**
   * Check if the current user has authorized the application.
   */
  checkAuth(immediate) {
    window['gapi']['auth']['authorize']({
        'client_id': CLIENT_ID,
        'scope': SCOPES,
        'immediate': immediate},
        result => {
          if (result && !result.error && !this.driveEnabled) {
            this.driveEnabled = true;
            $('#drive-button').addClass('active');
            // We are authorized, so let's se if we can load from the URL hash.
            // This seems to fail if we do it too early.
            window.setTimeout(this.loadFromHash, 500);
          }
        });
  }

  tryInitialAuth() {
    if (window['gapi'] && window['gapi']['auth'] && window['gapi']['auth']['authorize']) {
      this.checkAuth(true);
    } else {
      window.setTimeout(() => {
        this.tryInitialAuth();
      }, 500);
    }
  }

  waitForFullAuth() {
    window.setTimeout(() => {
      if (!this.driveEnabled) {
        this.checkAuth(true);
        this.waitForFullAuth();
      } else {
        this.loadDialog();
      }
    }, 1000);
  }

  /**
   * Handles a file resource being returned from Drive.
   */
  handleFile(file) {
    this.file = file;
    $('#drive-filename').text(file['title']);
    window.location.hash = file['id'];
  }


  /**
   * Loads the drive dialog.
   */
  loadDialog() {
    $('#drive-dialog').addClass('visible');

    var text = this.state.outputText();
    // Don't save diagram if empty, just get's annoying.
    if (text.length > 5 && text != this.cachedText) {
      this.save();
    }
    this.loadFileList();
  }

  loadFileList() {
    this.safeExecute(this.getListRequest(), result => {
      $('#drive-file-list').children().remove();
      var items = result['items'];
      for (var i in items) {
        var entry = document.createElement('li');
        var title = document.createElement('a');
        entry.appendChild(title);
        title.href = '#' + items[i]['id'];
        $(title).click(function() { $('#drive-dialog').removeClass('visible'); });
        title.innerHTML = items[i]['title'];
        $('#drive-file-list').append(entry);
      }
    });
  }

  safeExecute(request, callback) {
    // Could make the API call, don't blow up tho (mobiles n stuff).
    try {
      request['execute'](function(result) {
        if (!result['error']) {
          callback(result);
        }
      });
    } catch (e) {}
  }

  /**
   * Repeatedly save the diagram if it is editable and loaded.
   */
  loopSave() {
    var text = this.state.outputText();
    if (text != this.cachedText && this.file && this.file['editable']) {
      this.save();
    }
    window.setTimeout(() => {
      this.loopSave();
    }, 5000);
  }

  /**
   * Saves the current diagram to drive.
   */
  save() {
    var text = this.state.outputText();
    $('#drive-save-state').text('Saving...');
    this.safeExecute(this.getSaveRequest(text), result => {
      this.handleFile(result);
      $('#drive-save-state').text('Saved');
      this.cachedText = text;
    });
  }

  loadFromHash() {
    if (window.location.hash.length > 1) {
      $('#drive-save-state').text('Loading...');
      var fileId = window.location.hash.substr(1, window.location.hash.length - 1);
      this.safeExecute(this.getLoadRequest(fileId), result => {
        this.handleFile(result);
        this.reloadFileContent();
      });
    }
  }

  reloadFileContent() {
    this.downloadFile(this.file['downloadUrl'], content => {
      $('#drive-save-state').text('Loaded');
      this.state.clear();
      this.state.fromText(content, this.view.screenToCell(new Vector(
              this.view.canvas.width / 2,
              this.view.canvas.height / 2)));
      this.state.commitDraw();
      this.cachedText = this.state.outputText();
    });
  }

  getSaveRequest(text) {
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
  }

  getLoadRequest(fileId) {
    return window['gapi']['client']['request']({
        'path': '/drive/v2/files/' + fileId,
        'method': 'GET'});
  }

  getListRequest() {
    return window['gapi']['client']['request']({
        'path': '/drive/v2/files',
        'params' : { 'q': 'mimeType = \'text/plain\' and trashed = false' },
        'method': 'GET'});
  }

  /**
   * Download a file's content.
   *
   * @param {string} url
   */
  downloadFile(url, callback) {
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
}
