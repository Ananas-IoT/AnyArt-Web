<template>
  <v-app>
    <div class="auth-wrap register">
      <app-header></app-header>
      <v-stepper
        class="stepper"
        v-model="stepperCurrent"
        :alt-labels="true">


        <!--<v-alert-->
          <!--class="alert register__alert"-->
          <!--v-if="registerResponse"-->
          <!--:value="true"-->
          <!--type="success"-->
        <!--&gt;-->
          <!--{{registerResponse.text}}-->
        <!--</v-alert>-->

        <v-alert
          class="alert"
          v-if="registerError"
          :value="true"
          type="error"
        >
          {{registerError.text}}
        </v-alert>

        <v-stepper-header
          class="auth-stepper-header stepper-header">
          <v-stepper-step class="stepper-step" :complete="stepperCurrent > 1" step="1" @click="backToStep(1)">
            Account setup
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step class="stepper-step" :complete="stepperCurrent > 2" step="2" @click="backToStep(2)">
            Personal details
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step class="stepper-step" :complete="stepperCurrent > 3" step="3" @click="backToStep(3)">
            Social profile
          </v-stepper-step>
        </v-stepper-header>

        <h2 class="form__title">Create an account</h2>
        <p class="form__subtitle">to upload requests and vote for them</p>

        <v-stepper-items class="stepper-items">
          <v-stepper-content step="1">
            <v-card
              class="stepper-items__card"
              height="190px"
            >
              <v-form v-model="validation">
                <v-text-field
                  label="Email"
                  v-model="user.email"
                  :rules="inputRules"
                  autofocus
                >
                </v-text-field>
                <v-text-field
                  label="Password"
                  v-model="user.password"
                  :rules="inputRules"
                  type="password"
                >
                </v-text-field>
                <v-text-field
                  label="Confirm password"
                  type="password"
                >
                </v-text-field>
              </v-form>
            </v-card>
            <v-btn
              color="primary"
              @click="stepperCurrent = 2; validation = false"
              :disabled="!validation"
            >Continue
            </v-btn>
          </v-stepper-content>
          <v-stepper-content step="2">
            <v-card
              class="stepper-items__card"
              height="190px"
            >
              <v-form v-model="validation">
                <v-text-field
                  label="Username"
                  v-model="user.username"
                  :rules="inputRules"
                  autofocus
                >
                </v-text-field>
                <v-text-field
                  label="First name"
                  v-model="user.first_name"
                  :rules="inputRules"
                >
                </v-text-field>
                <v-text-field
                  label="Last name"
                  v-model="user.last_name"
                  :rules="inputRules"
                >
                </v-text-field>
              </v-form>
            </v-card>
            <v-btn
              color="primary"
              @click="stepperCurrent = 3"
              :disabled="!validation"
            >Continue
            </v-btn>
          </v-stepper-content>
          <v-stepper-content step="3">
            <v-card
              class="stepper-items__card"
              height="160px"
            >
              <p class="register__role-description">{{roleDescription}}</p>
              <div v-if="user.rights === 'basic'">
                <div @click="becomeArtist" class="register__become-artist-button">I want to be an Artist!</div>
                <p class="register__role-description">{{descriptionList.artist}}</p>
              </div>
            </v-card>
            <v-btn
              color="primary"
              @click="addNewUser"
            >Create account
            </v-btn>
          </v-stepper-content>
        </v-stepper-items>

      </v-stepper>
    </div>

  </v-app>
</template>

<script>
  import {registerUser} from "../../api/auth";
  import eventBus from '../../eventBus';
  import AppHeader from '../the-header';

  export default {
    name: "register",
    components: {
      'app-header': AppHeader
    },
    data() {
      return {
        stepperCurrent: 0,
        user: {
          rights: 'basic'
        },
        validation: false,
        descriptionList: {
          basic: 'As a basic user, you will be able to upload photo with request and vote for artist sketches!',
          artist: 'You will have all basic user functions plus ability to upload your sketch'
        },
        inputRules: [
          v => !!v || 'Field is required'
        ],
        // registerResponse: null,
        registerError: null
      }
    },
    created() {
      eventBus.$on('registerError', (error) => {
        console.log(error.response);
        this.registerError = {
          boolean: true,
          text: error.response.data.non_field_errors[0],
        };
        setTimeout(() => {
          this.registerError = null
        }, 3000);
      });
    },
    computed: {
      roleDescription() {
        return this.user.rights === 'artist' ? this.descriptionList.artist : this.descriptionList.basic;
      }
    },
    methods: {
      becomeArtist: function () {
        this.user.rights = 'artist';
      },

      addNewUser: function () {
        registerUser(this.user);
      },

      backToStep(stepToBack) {
        if (this.stepperCurrent > stepToBack) {
          this.stepperCurrent = stepToBack;
          this.validation = true;
        }
      }
    }
  }
</script>

<style scoped>

  .form__title {
    margin: 30px 0 10px;
  }

  .form__subtitle {
    font-size: 14px;
    margin: 0;
  }

  .register__become-artist-button {
    width: fit-content;
    width: -moz-fit-content;
    margin: auto;
    font-family: "PT Sans Bold";
    color: #770d85;
    border-bottom: 1px solid transparent;
    cursor: pointer;
    transition: 0.1s;
  }

  .register__role-description {
    text-align: justify;
    font-size: 16px;
  }

  .register__become-artist-button:hover {
    border-bottom: 1px solid #7d42b9;
  }

  div + .register__role-description {
    text-align: center;
    margin: 5px 0 10px;
    font-size: 14px;
  }

</style>
