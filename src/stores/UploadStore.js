import AppDispatcher from '../dispatcher/AppDispatcher';
import UploadConstants from '../constants/UploadConstants';
import assign from 'object-assign';
import EventEmitter from 'eventemitter3';

var _uploads = {};

function clearUploads(uploaderId) {
  _uploads[uploaderId] = {};
}

var UploadStore = assign({}, EventEmitter.prototype, {
  CHANGE_EVENT: 'change',
  addUpload: function(uploaderId, file) {
    if (_uploads[uploaderId] == undefined) {
      _uploads[uploaderId] = {};
    }

    _uploads[uploaderId][file.id] = { file: file };
  },
  updateUpload: function(uploaderId, id, data) {
    assign(_uploads[uploaderId][id], data);
  },
  getByUploaderId: function(uploaderId) {
    return _uploads[uploaderId] || {};
  },
  getValidUploads: function(uploaderId) {
    var output = {};
    var uploadIds = Object.keys(_uploads[uploaderId] || {});

    for (var i = 0; i < uploadIds.length; i++) {
      var upload = _uploads[uploaderId][uploadIds[i]];
      if (upload.error == null && upload.file && upload.file.accepted == true) {
        output[uploadIds[i]] = upload;
      }
    }

    return output;
  },
  emitChange: function() {
    this.emit(this.CHANGE_EVENT);
  }
});

AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case UploadConstants.ADD_UPLOAD:
      UploadStore.addUpload(action.uploaderId, action.file);
      UploadStore.emitChange();
      break;
    case UploadConstants.UPDATE_UPLOAD:
      UploadStore.updateUpload(action.uploaderId, action.id, action.data);
      UploadStore.emitChange();
      break;
    case UploadConstants.CLEAR_UPLOADS:
      clearUploads(action.uploaderId);
      UploadStore.emitChange();
      break;

    default:
      // Nothing to do here.
  }
});

export default UploadStore;
