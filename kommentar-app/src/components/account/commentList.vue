<template>
    <div>
        <!-- Filter -->
        <h4 style="font-size:3vh;margin-top:1vh">Search Your Comment With DOI:</h4>
        <a-input placeholder="DOI...."  v-model="searchDOI" style="width:40%;margin-top:0"/>

        <!-- List of Comments -->
        <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="commentList">
            <a-list-item slot="renderItem" slot-scope="comment,index"  v-show="relate(comment)" >
                <!-- Detail about this comment -->
                <a-descriptions  bordered  :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }">
                    <a-descriptions-item label="Update Date">{{new Date(Date.parse(comment.createDate)).toLocaleString()}}</a-descriptions-item>
                    <a-descriptions-item label="type">{{comment.type}}</a-descriptions-item>
                    <a-descriptions-item label="Book Link">
                        <p @click="seeDetail(comment.doi_nr)" style="cursor:pointer;color:#1890ff">{{comment.title}}</p>
                        <a :href="'https://dx.doi.org/'+ comment.doi_nr"  target="_blank">{{comment.doi_nr}}</a>
                    </a-descriptions-item>
                    <a-descriptions-item label="Requests in Checking">
                        <!-- Cancel Review Request -->
                        <span  @click="request('Review',comment,true)"   v-if="comment.status['Review']">
                            <a-tag>Review</a-tag>
                        </span >
                        
                        <!-- Cancel PID Request -->
                        <span  @click="request('PID',comment,true)"  v-if="comment.status['PID']">
                            <a-tag >PID</a-tag>
                        </span>

                        <span v-if="comment.status['PID']||comment.status['Review']"> (Click to cancel)</span>
                        
                    </a-descriptions-item>

                    <a-descriptions-item label="New Request">
                        
                        <!-- Review Request -->
                        <span v-if="!comment.status['Review']&&comment.type!='official'"  @click="request('Review',comment,false)">
                            <a-tag color="cyan" >Review</a-tag>
                        </span >
                        

                        <!-- PID Request -->
                        <span  
                        v-if=" !comment.status['PID'] && role.includes('Researcher')&&comment.type!='official'" 
                        @click="request('PID',comment,false)">
                            <a-tag color="cyan" >PID</a-tag>
                        </span >
                        
                    </a-descriptions-item>
                    
                    <a-descriptions-item label="Content" span=3>
                        <p v-if="!editorVisibility[index]" v-html="comment.content" class="ql-editor" style="max-height:25vh;overflow:auto;"></p>
                        <div v-if="editorVisibility[index]"> 
                            <quill-editor
                            v-model="templateComment.content"
                            :options="editorOption"
                            >
                            </quill-editor>
                            <a-button @click="editorRequest" style="margin-top:1vh">Submit</a-button>
                        </div>
                        
                        <a-button :disabled="comment.type=='official'" icon="edit" @click="openEditor(comment,index)" style="margin-top:1vh;margin-right:1vw">Editor</a-button>
                        <a-button v-if="!(comment.type=='official')" @click="deleteComment(comment)" icon="delete" style="margin-top:1vh">Delete</a-button>
                    </a-descriptions-item>
                </a-descriptions>

            </a-list-item>
            
        </a-list>
    </div>
</template>

<script>
 
    export default {
        name:"reviewer",


        data(){
            return{
               
                templateComment:{},
                title:[],
               
                pagination: {
                    pageSize: 6,
                },
                searchDOI:"",

                editorVisibility:[],
                editorOption: {    // style for quill-editor
                    placeholder: "Please write down your comment....",
                    modules:{
                        toolbar:[
                                ['bold', 'italic', 'underline', 'strike'],    // toggled buttons
                                [{ 'font': [] }],  
                                [{ 'color': [] }],   // font color
                                ]
                            }
                }, 
            }
        },

        computed: {
    
            username() {
                return this.$store.state.account.username;
            },

            role() {
                return this.$store.state.account.role;
            },

            commentList(){
                
                return  this.$store.state.account.commentList;
            },
            
        },

        mounted(){
            this.getCommentList();
        },

        methods:{
            
            /**
             * Request the CommentList, which Author is the user, from background
             */
            async getCommentList(){

                // get CommentList form firebase, the status from these comments is "in Review"
                this.$store.dispatch("account/getCommentList")
                                            .catch(err => {
                                                            console.log(err);
                                                         });

            },
            /**
             * Send request to the firebase
             * @param request - "Review" or "PID"
             * @param comment
             * @param cancel -"whether it is about a cancel or not"
             */
            request(request,comment,cancel){
                var request ={
                    uid:comment.commitKey,
                    doi:comment.doi_nr, 
                    requestType:request,
                }
                let requestDist="askFromUser/askForRequest";
                if (cancel)
                    requestDist=requestDist.concat("Cancel");
                this.$store.dispatch(requestDist,request)
                .then(()=>{
                    
                    // Refresh the display, prompting success                    
                        this.$notification.open({
                            message: 'Success',
                            description:
                            'Your Request has been submitted.',
                            icon: <a-icon type="smile" style="color: #108ee9" />,
                        });  
                        comment.status[request.requestType]=!comment.status[request.requestType];
                        //this.getCommentList();

                    })
                .catch(err => {
                                console.log(err);
                            });
 
            },

            /**
             * send Editor Request to firebase
             */
            editorRequest(){
                var request ={
                    uid:this.templateComment.commitKey, 
                    doi:this.templateComment.doi_nr,
                    attribute:"content",
                    value:this.templateComment.content,
                }
                this.$store.dispatch("askFromUser/setAttribute",request)
                .then(()=>{
                   
                   // Refresh the display, prompting success                   
                    this.$notification.open({
                        message: 'Success',
                        description:
                        'Your Request has been submitted.',
                        icon: <a-icon type="smile" style="color: #108ee9" />,
                    });  
                    
                    this.editorVisibility =[];
                    this.getCommentList();

                    })
                .catch(err => {
                                console.log(err);
                            });

            },

            /**
             * send delete Request to firebase
             */
            deleteComment(comment){
                
                this.$store.dispatch("askFromUser/deleteComment",{
                    uid:comment.commitKey,
                    doi:comment.doi_nr,
                }).then(()=>{
                    this.getCommentList();
                });
            
            },

            
            /**
             * open a new window which shows the details of this book
             */
            seeDetail(doi){

                // build router address
                let routeData = this.$router.resolve({
                    path: '/detail', 
                    query:{doi:doi},   
                });

                //open a new window
                window.open(routeData.href, "_blank");

            },
            
            /**
             * @param comment - the comment which user wants to edit
             */
            openEditor(comment,index){
                this.templateComment =JSON.parse(JSON.stringify(comment));
                if (this.editorVisibility[index])
                    this.editorVisibility=[];
                else
                {
                    this.editorVisibility=[];
                    this.editorVisibility[index] = true;
                }
            },

            relate(comment){
                return (!this.searchDOI || comment.doi_nr.includes(this.searchDOI))? true:false;
            }


        }

        
    }
</script>

<style>
.avatarp{
    font-size: 2.5vw;
    line-height: 4.4vw;
}
</style>