import firebase from "firebase/app";


const state = () => ({
  
})

const getters = {}
const actions = {
    
    //the function that used from app-admin side.
    //requestType is Review/PID
    //roRole: one of ['Researcher', 'Reviewer','Moderator','Admin']
    async getUserList({}, { toRole }) {
        return firebase.database().ref('updateRole/'+toRole)
        .once('value')
        .then((userinfo)=>{
            if (userinfo.val())
                return (userinfo.val())
            else
                return {}
        }).catch((error) => {
            //for debug only, will be finished later
            console.log(error.message);
        });  

    },
    //flag: true agree to update, false regret to update
    async updateRole({}, {flag,userKey,feedback_content, toRole }){
        return firebase.database().ref('updateRole/'+toRole+"/"+userKey).once('value')
        .then((info) => {
            if (info.val())
            {
                firebase.database().ref('updateRole/'+toRole).child(userKey).remove();
                firebase.database().ref('users/' + userKey+'/update/'+toRole).set(false);
                if (flag)
                {
                    firebase.database().ref('users/' + userKey+'/role')
                    .once('value')
                    .then((roles)=>{
                        let setroles=roles.val();
                        setroles.push(toRole);
                        firebase.database().ref('users/' + userKey+'/role').set(setroles);
                    })
                }
                if (feedback_content){
                    firebase.database().ref("users/"+userKey+"/Messagebox/"+toRole).set({
                        feedbackContent:feedback_content,
                        toRole:toRole,
                    }); 
                }
            }
            else 
                return "This UpdateRequest is already answered by another App-Admin, your operation is failed"
        }).catch((error) => {
            //for debug only, will be finished later
            console.log(error.message);
        }); 

    },
    //actions for reviewer
    async getCommentListForRequest({},{requestType}){
        return firebase.database().ref(requestType)
        .once('value')
        .then((userinfo)=>{
            if (userinfo.val())
                return (userinfo.val())
            else
                return {}
        }).catch((error) => {
            //for debug only, will be finished later
            console.log(error.message);
        }); 
    },

    //flag:true agree with PID
    async replyRequest({ dispatch },{doi,user_id,requestType,comment_uid,comment_content,feedback_content,flag}){
        //describe whether comment request is already edited by another reviewer
        return firebase.database().ref(requestType+"/"+comment_uid).once('value')
        .then((info) => {
            if (info.val())
            {
                firebase.database().ref(requestType).child(comment_uid).remove();
                //use setAttribute in askFromUser to set status of request
                dispatch('askFromUser/setAttribute',{
                    uid:comment_uid, 
                    doi:doi ,
                    attribute:"status/"+requestType,
                    value:false  
                },{ root: true });
                if (feedback_content){
                    firebase.database().ref("users/"+user_id+"/Messagebox/"+comment_uid).set({
                        feedbackContent:feedback_content,
                        commentContent:comment_content,
                        doi_nr:doi
                    }); 
                }
                
                if (requestType=="PID" && flag){
                    firebase.database().ref("users/"+user_id+"/comments/"+comment_uid+"/type").set("official");
                    firebase.database().ref("Review").child(comment_uid).remove();
                    dispatch('askFromUser/setAttribute',{
                        uid:comment_uid, 
                        doi:doi ,
                        attribute:"type",
                        value:"official" 
                    },{ root: true });
                    dispatch('askFromUser/setAttribute',{
                        uid:comment_uid, 
                        doi:doi ,
                        attribute:"PermanentID",
                        value: comment_uid
                    },{ root: true });
                    
                }
            }
            else 
                return "This Request is already answered by another Reviewer, your operation is failed"
        }).catch((error) => {
            //for debug only, will be finished later
            console.log(error.message);
        }); 
    }

}

const mutations = {

    
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}