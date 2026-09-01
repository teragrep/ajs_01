/*
 * Teragrep User Interface (ajs_01)
 * Copyright (C) 2019-2026 Suomen Kanuuna Oy
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 * Additional permission under GNU Affero General Public License version 3
 * section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with other code, such other code is not for that reason alone subject to any
 * of the requirements of the GNU Affero GPL version 3 as long as this Program
 * is the same Program as licensed from Suomen Kanuuna Oy without any additional
 * modifications.
 *
 * Supplemented terms under GNU Affero General Public License version 3
 * section 7
 *
 * Origin of the software must be attributed to Suomen Kanuuna Oy. Any modified
 * versions must be marked as "Modified version of" The Program.
 *
 * Names of the licensors and authors may not be used for publicity purposes.
 *
 * No rights are granted for use of trade names, trademarks, or service marks
 * which are in The Program if any.
 *
 * Licensee must indemnify licensors and authors for any liability that these
 * contractual assumptions impose on licensors and authors.
 *
 * To the extent this program is licensed as part of the Commercial versions of
 * Teragrep, the applicable Commercial License may apply to this file if you as
 * a licensee so wish it.
 */
export const enum sendOperation {
  note = 'NOTE',
  newNote= 'NEW_NOTE',
  notesInfo= 'NOTES_INFO',
  noteRunningStatus= 'NOTE_RUNNING_STATUS',
  listNoteJobs= 'LIST_NOTE_JOBS',
  listUpdateNoteJobs= 'LIST_UPDATE_NOTE_JOBS',
  authInfo= 'AUTH_INFO',
  paragraph= 'PARAGRAPH',
  patchParagraph= 'PATCH_PARAGRAPH',
  collaborativeModeStatus= 'COLLABORATIVE_MODE_STATUS',
  paragraphAppendOutput= 'PARAGRAPH_APPEND_OUTPUT',
  paragraphUpdateOutput='PARAGRAPH_UPDATE_OUTPUT',
  paragraphOutput='PARAGRAPH_OUTPUT',
  progress= 'PROGRESS',
  completionList= 'COMPLETION_LIST',
  editorSetting= 'EDITOR_SETTING',
  angularObjectUpdate= 'ANGULAR_OBJECT_UPDATE',
  angularObjectRemove= 'ANGULAR_OBJECT_REMOVE',
  appAppendOutput= 'APP_APPEND_OUTPUT',
  appUpdateOutput= 'APP_UPDATE_OUTPUT',
  appLoad= 'APP_LOAD',
  appStatusChange= 'APP_STATUS_CHANGE',
  listRevisionHistory= 'LIST_REVISION_HISTORY',
  noteRevision= 'NOTE_REVISION',
  noteRevisionForCompare= 'NOTE_REVISION_FOR_COMPARE',
  interpreterBindings= 'INTERPRETER_BINDINGS',
  errorInfo= 'ERROR_INFO',
  sessionLogout= 'SESSION_LOGOUT',
  configurationsInfo= 'CONFIGURATIONS_INFO',
  interpreterSettings= 'INTERPRETER_SETTINGS',
  paragraphAdded= 'PARAGRAPH_ADDED',
  paragraphRemoved=  'PARAGRAPH_REMOVED',
  paragraphMoved=  'PARAGRAPH_MOVED',
  noteUpdated= 'NOTE_UPDATED',
  setNoteRevision= 'SET_NOTE_REVISION',
  parasInfo= 'PARAS_INFO',
  convertedNoteNBFormat= 'CONVERTED_NOTE_NBFORMAT',
  interpreterInstallStarted= 'INTERPRETER_INSTALL_STARTED',
  interpreterInstallResult= 'INTERPRETER_INSTALL_RESULT',
  notice= 'NOTICE',
  pong= 'PONG',
  serverShutdown= 'SERVER_SHUTDOWN',
}

export const enum receiveOperation {
  ping= 'PING',
  getHomeNote= 'GET_HOME_NOTE',
  newNote= 'NEW_NOTE',
  moveNoteToTrash= 'MOVE_NOTE_TO_TRASH',
  moveFolderToTrash='MOVE_FOLDER_TO_TRASH',
  restoreNote= 'RESTORE_NOTE',
  restoreFolder= 'RESTORE_FOLDER',
  restoreAll= 'RESTORE_ALL',
  delNote= 'DEL_NOTE',
  removeFolder= 'REMOVE_FOLDER',
  emptyTrash= 'EMPTY_TRASH',
  cloneNote= 'CLONE_NOTE',
  listNotes= 'LIST_NOTES',
  reloadNotesFromRepo= 'RELOAD_NOTES_FROM_REPO',
  getNote= 'GET_NOTE',
  noteUpdate= 'NOTE_UPDATE',
  updatePersonalizedMode= 'UPDATE_PERSONALIZED_MODE',
  noteRename= 'NOTE_RENAME',
  folderRename= 'FOLDER_RENAME',
  moveParagraph= 'MOVE_PARAGRAPH',
  insertParagraph= 'INSERT_PARAGRAPH',
  copyParagraph= 'COPY_PARAGRAPH',
  angularObjectUpdated= 'ANGULAR_OBJECT_UPDATED',
  angularObjectClientBind= 'ANGULAR_OBJECT_CLIENT_BIND',
  angularObjectClientUnbind= 'ANGULAR_OBJECT_CLIENT_UNBIND',
  cancelParagraph= 'CANCEL_PARAGRAPH',
  runParagraph= 'RUN_PARAGRAPH',
  runAllParagraphs= 'RUN_ALL_PARAGRAPHS',
  paragraphRemove= 'PARAGRAPH_REMOVE',
  paragraphClearOutput= 'PARAGRAPH_CLEAR_OUTPUT',
  paragraphClearAllOutput= 'PARAGRAPH_CLEAR_ALL_OUTPUT',
  completion= 'COMPLETION',
  commitParagraph= 'COMMIT_PARAGRAPH',
  patchParagraph= 'PATCH_PARAGRAPH',
  importNote= 'IMPORT_NOTE',
  convertNoteNBFormat= 'CONVERT_NOTE_NBFORMAT',
  checkpointNote= 'CHECKPOINT_NOTE',
  setNoteRevision= 'SET_NOTE_REVISION',
  listRevisionHistory= 'LIST_REVISION_HISTORY',
  noteRevision= 'NOTE_REVISION',
  noteRevisionForCompare= 'NOTE_REVISION_FOR_COMPARE',
  editorSetting= 'EDITOR_SETTING',
  listNoteJobs= 'LIST_NOTE_JOBS',
  unsubscribeUpdateNoteJobs= 'UNSUBSCRIBE_UPDATE_NOTE_JOBS',
  listUpdateNoteJobs= 'LIST_UPDATE_NOTE_JOBS',
  getInterpreterBindings= 'GET_INTERPRETER_BINDINGS',
  saveInterpreterBindings= 'SAVE_INTERPRETER_BINDINGS',
  listConfigurations= 'LIST_CONFIGURATIONS',
  getInterpreterSettings= 'GET_INTERPRETER_SETTINGS',
  paragraphUpdateResult= 'PARAGRAPH_UPDATE_RESULT',
  paragraphOutputRequest='PARAGRAPH_OUTPUT_REQUEST',
}
