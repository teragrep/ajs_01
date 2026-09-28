/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import angular from 'angular';
import * as JsDiff from 'diff';
import './revisions-comparator.html';
import moment from 'moment';

/*
export const RevisionsComparatorComponent = {
  template: revisionsComparatorTemplate,
  controller: RevisionsComparatorController,
  bindings: {
    noteRevisions: '<',
  },
};

export const RevisionsComparatorModule = angular
  .module('zeppelinWebApp')
  .component('revisionsComparator', RevisionsComparatorComponent)
  .name;
*/

angular.module('zeppelinWebApp').component('revisionsComparator', {
  //template: '<b>{{template}}</b>',
  templateUrl: require('./revisions-comparator.html'),
  controller: ['$scope', 'websocketMsgSrv', '$routeParams', RevisionsComparatorController],
  bindings: {
    noteRevisions: '<',
  },
});

function RevisionsComparatorController($scope, websocketMsgSrv, $routeParams) {
  $scope.firstNoteRevisionForCompare = null;
  $scope.secondNoteRevisionForCompare = null;
  $scope.mergeNoteRevisionsForCompare = null;
  $scope.currentParagraphDiffDisplay = null;
  $scope.currentFirstRevisionForCompare = 'Choose...';
  $scope.currentSecondRevisionForCompare = 'Choose...';

  $scope.getNoteRevisionForReview = function(revision, position) {
    if (position) {
      if (position === 'first') {
        $scope.currentFirstRevisionForCompare = revision.message;
      } else {
        $scope.currentSecondRevisionForCompare = revision.message;
      }
      websocketMsgSrv.getNoteByRevisionForCompare($routeParams.noteId, revision.id, position);
    }
  };

  // compare revisions
  $scope.compareRevisions = function() {
    if ($scope.firstNoteRevisionForCompare && $scope.secondNoteRevisionForCompare) {
      const paragraphs1 = $scope.firstNoteRevisionForCompare.note.paragraphs;
      const paragraphs2 = $scope.secondNoteRevisionForCompare.note.paragraphs;
      const added = 'added';
      const deleted = 'deleted';
      const compared = 'compared';
      const merge = [];
      for (const p1 of paragraphs1) {
        let p2 = null;
        for (const p of paragraphs2) {
          if (p1.id === p.id) {
            p2 = p;
            break;
          }
        }
        if (p2 === null) {
          merge.push({paragraph: p1, firstString: (p1.text || '').split('\n')[0], type: deleted});
        } else {
          let colorClass = '';
          let span = null;
          const text1 = p1.text || '';
          const text2 = p2.text || '';

          const diff = JsDiff.diffLines(text1, text2);
          const diffHtml = document.createDocumentFragment();
          let identical = true;
          const identicalClass = 'color-black';

          diff.forEach(function(part) {
            colorClass = part.added ? 'color-green-row' : part.removed ? 'color-red-row' : identicalClass;
            span = document.createElement('span');
            span.className = colorClass;
            if (identical && colorClass !== identicalClass) {
              identical = false;
            }

            let str = part.value;

            if (str[str.length - 1] !== '\n') {
              str = `${str}\n`;
            }

            span.appendChild(document.createTextNode(str));
            diffHtml.appendChild(span);
          });

          const pre = document.createElement('pre');
          pre.appendChild(diffHtml);

          merge.push(
            {
              paragraph: p1,
              diff: pre.innerHTML,
              identical: identical,
              firstString: (p1.text || '').split('\n')[0],
              type: compared,
            });
        }
      }

      for (const p2 of paragraphs2) {
        let p1 = null;
        for (const p of paragraphs1) {
          if (p2.id === p.id) {
            p1 = p;
            break;
          }
        }
        if (p1 === null) {
          merge.push({paragraph: p2, firstString: (p2.text || '').split('\n')[0], type: added});
        }
      }

      merge.sort(function(a, b) {
        if (a.type === added) {
          return -1;
        }
        if (a.type === compared) {
          return 1;
        }
        if (a.type === deleted) {
          if (b.type === compared) {
            return -1;
          } else {
            return 1;
          }
        }
      });

      $scope.mergeNoteRevisionsForCompare = merge;

      if ($scope.currentParagraphDiffDisplay !== null) {
        $scope.changeCurrentParagraphDiffDisplay($scope.currentParagraphDiffDisplay.paragraph.id);
      }
    }
  };

  $scope.$on('noteRevisionForCompare', function(event, data) {
    if (data.note && data.position) {
      if (data.position === 'first') {
        $scope.firstNoteRevisionForCompare = data;
      } else {
        $scope.secondNoteRevisionForCompare = data;
      }

      if ($scope.firstNoteRevisionForCompare !== null && $scope.secondNoteRevisionForCompare !== null &&
        $scope.firstNoteRevisionForCompare.revisionId !== $scope.secondNoteRevisionForCompare.revisionId) {
        $scope.compareRevisions();
      }
    }
  });

  $scope.formatRevisionDate = function(date) {
    return moment.unix(date).format('MMMM Do YYYY, h:mm:ss a');
  };

  $scope.changeCurrentParagraphDiffDisplay = function(paragraphId) {
    for (const p of $scope.mergeNoteRevisionsForCompare) {
      if (p.paragraph.id === paragraphId) {
        $scope.currentParagraphDiffDisplay = p;
        return;
      }
    }
    $scope.currentParagraphDiffDisplay = null;
  };
}
