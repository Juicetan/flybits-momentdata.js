/**
 * @classdesc
 * @class
 * @extends BaseController
 * @param {external:ZoneMomentInstance} zmi ZoneMomentInstance model from which content is to be consumed.
 */
Fmd.Poll = (function(){
  var ObjUtil = Fmd.util.Obj;
  var ApiUtil = Fmd.util.Api;
  var Deferred = Fmd.Deferred;
  var Validation = Fmd.Validation;

  var PollController = function(zmi){
    BaseController.call(this,zmi);
  };

  PollController.prototype = Object.create(BaseController.prototype);
  PollController.prototype.constructor = PollController;
  PollController.prototype.res = PollController.res = ObjUtil.extend({
    POLLS: '/votingpollbits',
    POLL: '/VotingPolls'
  },BaseController.prototype.res);

  PollController.SINGLESELECT = PollController.prototype.SINGLESELECT = 0;
  PollController.MULTISELECT = PollController.prototype.MULTISELECT = 1;

  var sanitizeMeta = function(data){
    var retObj = {
      id: data.id,
      startEpoch: data.startsAt,
      endEpoch: data.endsAt,
      polls: [],
      allowVoteUpdates: data.allowUpdateVotes
    };

    if(data.votingPolls.length > 0){
      retObj.polls = data.votingPolls.map(function(obj){
        return {
          id: obj.id,
          type: obj.type,
          question: obj.question,
          hasUserVoted: obj.hasUserVoted,
          choices: obj.choices.map(function(choice){
            return {
              id: choice.id,
              text: choice.text,
              votes: choice.votes
            };
          })
        };
      });
    }

    return retObj;
  };

  PollController.prototype.getMainData = function(){
    var def = new Deferred();
    var url = this.host + this.res.POLLS + "?alllocales=true";

    fetch(url,{
      method: 'GET',
      credentials: 'include',
      headers:{
        'Accept-Language': 'en'
      }
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      try{
        var resp = ApiUtil.parseResponse(respStr);
        if(resp){
          resp = sanitizeMeta(resp);
        }
        def.resolve(resp);
      } catch(e){
        def.reject(new Validation().addError("Request Failed","Unexpected server response.",{
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Poll retrieval failed',resultStr,{
          serverCode: resp.status
        }));
      });
    });

    return def.promise;
  };

  /**
   * This is an `Object` that maps Poll IDs to arrays of Choice IDs.  That is
   * to say it is a simple map of a user's voting choices to poll questions.
   * @example
   * {
   *   340: [111,112,113],
   *   341: [342]
   * }
   * @typedef PollChoiceMap
   * @memberof Fmd.Poll
   * @type Object
   * @property {number[]} {pollID} An array of Choice IDs.
   */


  var vote = function(pollID,choiceIDArr){
    var def = new Deferred();
    var url = this.host + this.res.POLL + "/" + pollID + "/Vote";

    fetch(url,{
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(choiceIDArr)
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(respStr){
      def.resolve();
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        def.reject(new Validation().addError('Failed to submit vote',resultStr,{
          serverCode: resp.status,
          context: {pollID: pollID,choiceIDArr: choiceIDArr}
        }));
      });
    });

    return def.promise;
  };

  /**
   * Submits a vote to multiple Polls of a Moment instance.
   * @memberof Fmd.Poll
   * @function submitVote
   * @param {Fmd.Poll.PollChoiceMap} pollChoiceMap
   * @returns {external:Promise<Object,Fmd.Validation>} Promise that resolves if vote has succeeded. Promise rejects with possible errors regarding each Poll submission.
   */
  PollController.prototype.submitVote = function(pollChoiceMap){
    var def = new Deferred();
    var pollIDs = Object.keys(pollChoiceMap);
    var promises = [];

    for(var i = 0; i < pollIDs.length; i++){
      var votePromise = vote.call(this,pollIDs[i],pollChoiceMap[pollIDs[i]]);
      promises.push(votePromise);
    }

    Promise.settle(promises).then(function(resultArr){
      var rejected = resultArr.filter(function(obj){
        return obj.status === 'rejected';
      });
      var errors = rejected.map(function(obj){
        return obj.result.firstError();
      });
      if(rejected.length > 0){
        var validation = new Validation();
        validation.errors = errors;
        def.reject(validation);
      } else{
        def.resolve();
      }
    });

    return def.promise;
  };


  return PollController;
})();
