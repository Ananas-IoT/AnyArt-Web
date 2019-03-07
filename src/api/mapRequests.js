import axios from 'axios';
import store from '../store/store'
import {router} from '../main.js'
import eventBus from '../eventBus'

const API_URL = 'https://anyart.pythonanywhere.com';

export function sendRequest(request) {
  let token = store.getters.getUserToken;

  var bodyFormData = new FormData();
  bodyFormData.set('workload[requirements]', 'test');
  bodyFormData.set('description', request.description);
  bodyFormData.set('location[lat]', "" + request.position.lat);
  bodyFormData.set('location[lng]', "" + request.position.lng);
  bodyFormData.append('wall_photo0', request.photo);

  const config = {
    headers: {'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + token}
  };

  const url = `${API_URL}/workload/wall_photo_wrappers/`;
  axios.post(url, bodyFormData, config)
    .then(response => {
      console.log(response);
      getLastRequest(response.data.id);
    })
    .catch(err => {
      console.log(err.data);
    });
}

export function getAllRequests() {
  console.log('getAllRequests started');

  const config = {
    headers: {}
  };

  const url = `${API_URL}/workload/wall_photo_wrappers/`;
  axios.get(url, config)
    .then(response => {
      console.log(response);
      for (let i = 0; i < response.data.count; i++) {
        store.dispatch('addRequest', response.data.results[i]);
      }
    })
    .catch(err => {
      console.log(err.data);
    });
}

function getLastRequest(request_id) {
  console.log(request_id);
  getRequestById(request_id, callback);
  function callback(lastRequest) {
    // console.log(lastRequest);
    store.dispatch('addRequest', lastRequest);
  }
}

function getRequestById(request_id, callback) {

  const config = {
    headers: {}
  };

  const url = `${API_URL}/workload/wall_photo_wrappers/${request_id}`;

  axios.get(url, config)
    .then(response => {
      // console.log(response.data);
      // return response.data;
      callback(response.data);
    });
}
