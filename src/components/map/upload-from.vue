<template>
  <v-app>
    <v-dialog
      v-model="uploadFormTriggerIf"
      :width="360"
      :content-class="'upload-form__dialog-wrap custom-scrollbar'"
    >
      <v-card class="upload-form">
        <v-alert
          class="alert"
          v-if="sendError"
          :value="true"
          type="error"
        >
          {{sendError.text}}
        </v-alert>

        <v-card-title class="upload-form__title">{{this.type}} form</v-card-title>
        <v-form v-model="validation">

          <div class="upload-form__img-preview-wrap">
            <img class="upload-form__img-preview" ref="photoPreview" v-show="computePhotoPreviewShow"
                 alt="photo preview..">
            <label class="upload-form__img-preview-label" for="files">Select Image</label>
            <input
              class="upload-form__img-preview-input"
              id="files"
              ref="photoUpload"
              @change="processPhoto()"
              type="file"
            >
          </div>

          <v-textarea
            label="Description"
            class="upload-form__description"
            v-model="description"
            :rows="4"
            :rules="inputRules"
            solo
            autofocus
          >
          </v-textarea>
          <div class="upload-form__request-address" v-if="requestAddress !== ''">{{requestAddress.formatted_address}}
          </div>
        </v-form>
        <v-btn
          class="upload-form__btn"
          color="primary"
          :loading="sendLoadingTriggerAnimation"
          :disabled="!validation"
          @click="chooseProcess"
        >Send
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="successMessage"
      :width="320"
      persistent
    >
      <v-card>
        <v-card-title class="upload-form__success-message__title">Information!</v-card-title>
        <v-card-text class="upload-form__success-message__text">Your {{this.type}} was successfully sent! We inform you
          that before appear on the map, your {{type}} should be approved! <br>
          If something will go wrong, we will inform you.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green" flat @click="successMessage = false">Ok, I understood
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import {sendRequest} from "../../api/mapRequests";
  import {sendSketch} from '../../api/mapSketches';

  export default {
    name: "UploadForm",
    components: {},
    props: {
      //Request or Sketch form
      type: {
        type: String,
        required: true
      },

      //for request address
      requestAddress: {
        default: () => ({
          name: '',
        })
      },

      //for sketch POST route
      workloadId: {
        default: null
      }
    },
    data() {
      return {
        //photo, description and position will be added
        request: {
          images: []
        },

        //photo and description will be added
        sketch: {
          images: []
        },

        //description chooses req or sketch automatically
        description: '',
        uploadFormTriggerIf: false,
        sendLoadingTriggerAnimation: false,
        inputRules: [
          v => !!v || 'Field is required'
        ],
        validation: false,
        sendError: null,
        successMessage: false
      }
    },
    created() {

    },
    computed: {
      computePhotoPreviewShow() {
        return this.sketch.images.length !== 0 || this.request.images.length !== 0;
      }
    },
    methods: {
      openUploadForm() {
        Object.assign(this.$data, this.resetData());
        this.uploadFormTriggerIf = true;
      },

      processRequest() {
        return new Promise((resolve, reject) => {
          this.sendLoadingTriggerAnimation = true;

          this.request.position = {
            lat: this.requestAddress.geometry.location.lat(),
            lng: this.requestAddress.geometry.location.lng()
          };
          this.request.description = this.description;
          sendRequest(this.request, resolve, reject);
        }).then(
          response => {
            this.sendLoadingTriggerAnimation = false;
            this.uploadFormTriggerIf = false;
            this.successMessage = true;
            this.$emit('clearPosition');
          },
          error => {
            this.sendLoadingTriggerAnimation = false;

            this.sendError = {
              boolean: true,
              text: error.response || "Unknown error occured",
            };
            setTimeout(() => {
              this.sendError = null;
            }, 3000);
          }
        );
      },

      processSketch() {
        return new Promise((resolve, reject) => {
          this.sendLoadingTriggerAnimation = true;

          this.sketch.description = this.description;
          sendSketch(this.sketch, this.workloadId, resolve, reject);
        }).then(
          response => {
            this.sendLoadingTriggerAnimation = false;
            this.uploadFormTriggerIf = false;
            this.successMessage = true;
            this.$emit('clearPosition');
          },
          error => {
            this.sendLoadingTriggerAnimation = false;

            this.sendError = {
              boolean: true,
              text: error.response || "Unknown error occured",
            };
            setTimeout(() => {
              this.sendError = null
            }, 3000);
          }
        );
      },

      chooseProcess() {
        return this.type === 'sketch' ? this.processSketch() : this.processRequest();
      },

      processPhoto() {
        var preview = this.$refs.photoPreview;
        var file = this.$refs.photoUpload.files[0];
        var reader = new FileReader();

        reader.onloadend = function () {
          preview.src = reader.result;
        };

        if (file) {
          reader.readAsDataURL(file);
          if (this.type === 'request') {
            this.request.images.push(file);
          } else if (this.type === 'sketch') {
            this.sketch.images.push(file);
          }
        } else {
          preview.src = '';
        }
      },
      resetData() {
        return {
          request: {
            images: []
          },
          sketch: {
            images: []
          },
          description: '',
          uploadFormTriggerIf: false,
          sendLoadingTriggerAnimation: false,
          validation: false,
        }
      }
    },
  }
</script>

<style scoped>
  .alert {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }

  .upload-form {
    position: relative;
    text-align: center;
    width: 100%;
    padding: 30px 15px;
    overflow-x: hidden;
  }

  .upload-form__title {
    display: inline-block;
    text-align: center;
    padding: 0;
    margin: 0 0 20px;
    font-size: 20px;
    font-family: "PT Sans Bold";
    text-transform: capitalize;
  }

  .upload-form__img-preview-wrap {
    text-align: center;
  }

  .upload-form__img-preview {
    display: block;
    max-width: 240px;
    max-height: 240px;
    margin: 0 auto 15px;
  }

  .upload-form__img-preview-input {
    display: none;
    color: transparent;
  }

  .upload-form__img-preview-label {
    display: inline-block;
    margin: auto;
    cursor: pointer;
    border-bottom: 1px solid #000;
  }

  .upload-form__description {
    width: 80%;
    margin: 20px auto 5px;
  }

  .upload-form__request-address {
    text-align: center;
    display: block;
    width: 80%;
    margin: 5px auto 20px;
  }

  .upload-form__btn {
    margin: 0;
  }

  .upload-form__success-message__title {
    display: block;
    text-align: center;
    width: 100%;
    font-size: 20px;
    font-family: "PT Sans Bold";
    padding-bottom: 0;
  }

  .upload-form__success-message__text {
    font-size: 16px;
    padding-bottom: 0;
  }

</style scoped>
