<template>
  <div>
      <!-- register Button -->
      <div class="reg1" @click="dialogFormVisible = true">Register<span class="iconfont icon-zhuce" style="font-size: inherit"></span></div>
     
      <!-- Register Form -->
      <mt-popup class="popform" style="color:black" v-model="dialogFormVisible" popup-transition="popup-fade"  @keydown.enter.native="confirm">
        
        <!-- Titel -->
        <h3 class="formtitle">Welcome!</h3>

        <!-- Form Body -->
        <mt-field class="fieldarea" label="Username" placeholder="Enter your E-Mail" v-model="form.username"/>
        <mt-field class="fieldarea" label="Password" placeholder="Enter a password" type="password" v-model="form.password"/>
        <mt-field class="fieldarea" label="Confirm Password" placeholder="Comfirm your password"  type="password" v-model="form.passwordComfirm"/>
        <span style="color:red;margin-left:6%;" v-show="passwordNotMatch">Does not match password</span>
        
        <!-- Button -->
        <div class="cbuttons">
          <el-button type="primary" @click.native="confirm">Confirm</el-button>
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
        </div>

      </mt-popup>

  </div>
</template>

<script>
export default {
  data(){
    return{
      dialogFormVisible: false,
      passwordComfirm:"",
      validationErrors: [],
      passwordNotMatch:false,
      form:{
        username:"",
        password:"",
      },
    }
  },
    methods:{
      resetError() {
        this.validationErrors = [];
        this.passwordNotMatch=false;
      },
      
      /**
       * Check whether the form of account and password is correct
       */
      confirm(){
        this.resetError();

        // check if the form is filled
        if(!this.form.username||!this.form.password||!this.form.passwordComfirm){    
          this.validationErrors.push("Username/Password can not be empty.")
          this.$message.warning('Username/Password can not be empty.');
        }

        // check the form of the password
        if (/.{6,}/.test(this.form.password) != true) { 
          this.validationErrors.push("Password must be at least 6 characters long");
          this.$message.warning("Password must be at least 6 characters long");
        }

        // Test whether the passwords entered twice are the same
        if (!(this.form.password === this.form.passwordComfirm)) {
          this.validationErrors.push("Passwords did not match");
          this.passwordNotMatch=true;
          this.$message.warning("Passwords did not match");
        }

        // Test for other errors
        if (this.validationErrors.length <= 0) {
          
          // send request to firebase
          this.signUp(); 
          this.dialogFormVisible=false;

        }
        
      },

     /**
      * Submit registration information to firebase
      */
      signUp(){
        this.$store.dispatch('account/regist',this.form).then(()=>{
          
          var error=this.$store.state.account.error;
          
          if(error){
              this.$message({         
                  type: 'error',
                  message: error,
                  duration: 3000
              });
          }
          else{
              this.$message({         
                  type: 'success',
                  message: "You have registered successfully. Welcome!",
                  duration: 3000
              });

          }
        })
      }
    }

};
</script>

<style>
.reg1{
    width: auto;
    height: 50px;
    color: #fff;
}
.iconfont icon-zhuce{
  font-size: inherit;
}

</style>