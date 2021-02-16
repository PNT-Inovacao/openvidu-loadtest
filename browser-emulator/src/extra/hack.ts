(<any>globalThis.window) = {console: console};
import OpenVidu = require('openvidu-browser/lib/OpenVidu/OpenVidu');
import Publisher = require('openvidu-browser/lib/OpenVidu/Publisher');
import {PublisherOverride} from './openvidu-browser/OpenVidu/Publisher';

const WebSocket = require("ws");
const fetch = require("node-fetch");
const LocalStorage = require('node-localstorage').LocalStorage;

const RTCPeerConnectionWRTC = require('wrtc').RTCPeerConnection;
const RTCIceCandidateWRTC = require('wrtc').RTCIceCandidate;
const RTCSessionDescriptionWRTC = require('wrtc').RTCSessionDescription;
const mediaDevicesWRTC = require('wrtc').mediaDevices;
const MediaStreamWRTC = require('wrtc').MediaStream;
const MediaStreamTrackWRTC = require('wrtc').MediaStreamTrack;
const getUserMediaWRTC = require('wrtc').getUserMedia;

export class Hack {
	constructor() {

		(<any>globalThis.navigator) = {
			userAgent: 'Node.js Testing'
		};
		(<any>globalThis.document) = {};
		globalThis.localStorage = new LocalStorage('./');
		const jsonStats = {'interval':10, 'httpEndpoint': `https://${process.env.LOCATION_HOSTNAME}/openvidu-browser/webrtcStats`};
		globalThis.localStorage.setItem('webrtc-stats-config', JSON.stringify(jsonStats));

		globalThis.fetch = fetch;
	}

	webrtc() {

		globalThis.RTCPeerConnection = RTCPeerConnectionWRTC;
		// window['RTCPeerConnection'] = RTCPeerConnection;
		window['RTCIceCandidate'] = RTCIceCandidateWRTC;
		window['RTCSessionDescription'] = RTCSessionDescriptionWRTC;
		window['getUserMedia'] = getUserMediaWRTC;
		window['MediaStream'] = MediaStreamWRTC;
		window['MediaStreamTrack'] = MediaStreamTrackWRTC;
		(<any>globalThis.navigator)['mediaDevices'] = mediaDevicesWRTC;

	}

	websocket() {
		globalThis.WebSocket = WebSocket;
	}

	openviduBrowser(){

		OpenVidu.OpenVidu = ((original) => {
			OpenVidu.OpenVidu.prototype.checkSystemRequirements = () => {return 1};
			return OpenVidu.OpenVidu;
		})(OpenVidu.OpenVidu);

		Publisher.Publisher = ((original) => {
			Publisher.Publisher.prototype.initializeVideoReference = PublisherOverride.prototype.initializeVideoReference;
			Publisher.Publisher.prototype.getVideoDimensions = PublisherOverride.prototype.getVideoDimensions;
			return PublisherOverride;
		})(Publisher.Publisher);
	}

	allowSelfSignedCertificate(){
		// Allowed self signed certificate
		process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
	}
}

