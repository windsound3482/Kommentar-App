<template>
    <div>
        <!-- List of Comments -->
        <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="commentList">
                 
            <a-list-item  v-if="comment.status.indexOf('PID')>-1"  slot="renderItem" slot-scope="comment" >
                
                <!-- About Author -->
                <a-list-item-meta>
                    <!-- Author -->
                    <a slot="title">{{ comment.author }}</a>
                    
                    <!-- Author picture -->  
                    <a-avatar slot="avatar" style="color: #f56a00; backgroundColor: #fde3cf">
                        <p class="avatarp">{{comment.author[0]}}</p>
                     </a-avatar>     
                </a-list-item-meta>
                
                <!-- Detail about this comment -->
                <a-descriptions  bordered  :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }">
                    <a-descriptions-item label="Create Date">{{comment.createDate}}</a-descriptions-item>
                    <a-descriptions-item label="type">{{comment.type}}</a-descriptions-item>
                    
                    <a-descriptions-item label="Book Link">
                        <p @click="seeDetail(comment.doi_nr)">{{comment.doi_nr}}</p>
                    </a-descriptions-item>

                    <a-descriptions-item label="Visibility">
                        <p v-show="comment.active">Yes</p>
                        <p v-show="!comment.active">No</p>
                    </a-descriptions-item>

                    <a-descriptions-item label="Request">
                        <a-tag color="purple" @click="visiblePID=true">PID</a-tag>
                    </a-descriptions-item>

                    <a-descriptions-item label="Content">
                       <p v-html="comment.content"></p>
                    </a-descriptions-item>

                </a-descriptions>

               
                <!-- Review Options -->
                <!-- Reply for Permanent ID -->
                <a-modal
                    title="Permanent ID"
                    :visible="visiblePID"
                    @ok="replyPID(comment)"
                    @cancel="handleCancel(comment)"
                    >

                    <b>Original Content</b>
                    <p v-html="comment.content"></p>

                    <!-- agree or not -->
                    <a-radio-group v-model="comment.agreePID" default-value="agree">
                        <a-radio-button value="agree">
                            Agree <a-icon type="check-square" theme="twoTone" two-tone-color="#52c41a"/>
                        </a-radio-button>
                        <a-radio-button value="refuse">
                            Refuse <a-icon type="close-square" theme="twoTone" two-tone-color="#eb2f96" />
                        </a-radio-button>
                    </a-radio-group>

                    <!-- Input -->
                    <quill-editor
                        v-model="comment.replyContentPID"
                        :options="editorOptionPID">
                    </quill-editor>
                   
                </a-modal>

            </a-list-item>
        </a-list>

    </div>
</template>

<script>
    export default {
        name:"reviewer",
        data(){
            return{
                commentList:[],

                pagination: {
                    onChange: page => {
                        console.log(page);
                    },
                    pageSize: 6,
                },

                
                visiblePID:false,
                editorOptionPID: {    // style for quill-editor by PID
                    placeholder: "Write your Reason......   \n(Must fill in, if the request is rejected)",
                    modules:{
                        toolbar:[
                                ['bold', 'italic', 'underline', 'strike'],    // toggled buttons
                                ['blockquote', ], 
                                [{ 'color': [] }],   // front color
                                ]
                            }
                }, 


            }
        },

        mounted(){
            this.getCommentList();
        },

        methods:{
            
            /**
             * ! 涉及后端交互 getCommentListInReview() 
             * Request the CommentList, which status has "PID", from background
             */
            async getCommentList(){

                // open the loading-animation
                this.loading=true;

                // get CommentList form firebase, the status from these comments is "in Review"
                // TODO:this.$store.....getCommentListInReview("PID");
                // TODO:this.commentList = result;


                // !FOR TEST     
                var result = await this.$store.dispatch("commitwork/loadComments", 
                                                    {doi: "10.18034/abcra", 
                                                     rankType: 'submittime',
                                                     username: this.$store.state.account.username,
                                                     type:"unofficial"})
                                            .catch(err => {
                                                            console.log(err);
                                                         });
                this.commentList = result;
                for(var comment of this.commentList){
                    comment.status=["Review","PID"];
                }

                // close the loading-animation 
                this.loading=false; 

            },

            /**
             * ! 涉及后端交互 
             * ! 接口 replyPID(UID,agree,reason) reason can be empty
             * Send to the firebase whether the request for PermanentID is passed
             * 
             * @param agree {boolean}  - true, if the Reviewer is agree
             * @param comment
             */
            replyPID(comment){
                var reason = comment.replyContentPID;
                var agree = !(comment.agreePID=="refuse");

                if(agree){
                    //TODO this.$store.dispatch("replyPID",this.comment.UID,agree,reason);
                    // the reason can be empty hier
                }
                else{

                    // check if the reason is filled
                    if(!reason){
                        this.$error({
                            title: 'Error message',
                            content: 'Please write down your Reason (Must fill in, if the request is rejected)',
                        });
                        return;
                    }
                    else{
                        //TODO this.$store.dispatch("replyPID",this.comment.UID,agree,reason);
                    }
                }

                // Refresh the display, prompting success
                 var index =  this.commentList.indexOf(comment);
                if (index > -1) {
                    this.commentList.splice(index, 1);
                }
                this.visiblePID = false;
                this.$notification.open({
                    message: 'Success',
                    description:
                    'Your evaluation has been communicated.',
                    icon: <a-icon type="smile" style="color: #108ee9" />,
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
             * reset the comment by Cancel
             * @param comment
             */
            handleCancel(comment){
                comment.replyContentPID ="",
                comment.agreePID = true;
                this.visiblePID =false;
            },

        }

        
    }
</script>

<style>
.avatarp{
    font-size: 2.5vw;
    line-height: 4.4vw;
}
</style>