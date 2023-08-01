(<any>globalThis.window) = { console: console };
import OpenVidu from 'openvidu-browser/lib/OpenVidu/OpenVidu';
import Publisher from 'openvidu-browser/lib/OpenVidu/Publisher';
import { PublisherOverride } from './webrtc-bindings/openvidu-browser/Publisher';

import WebSocket from 'ws';
import fetch from 'node-fetch';
import { LocalStorage } from 'node-localstorage';
import platform from 'platform';
import { EMULATED_USER_TYPE } from '../config';
import { EmulatedUserType } from '../types/config.type';

import { RTCPeerConnection as RTCPeerConnectionWRTC } from 'wrtc';
import { RTCIceCandidate as RTCIceCandidateWRTC } from 'wrtc';
import { RTCSessionDescription as RTCSessionDescriptionWRTC } from 'wrtc';
import { mediaDevices as mediaDevicesWRTC } from 'wrtc';
import { MediaStream as MediaStreamWRTC } from 'wrtc';
import { MediaStreamTrack as MediaStreamTrackWRTC } from 'wrtc';
import { getUserMedia as getUserMediaWRTC } from 'wrtc';

import * as KurentoWebRTC from './webrtc-bindings/kurento-webrtc/KurentoWebRTC';

export class HackService {
	constructor() {
		(<any>globalThis.navigator) = {
			userAgent: 'Node.js Testing',
		};
		(<any>globalThis.document) = {};
		(<any>globalThis.HTMLElement) = null;
		globalThis.localStorage = new LocalStorage('./');
		globalThis.fetch = fetch as any;
	}

	async webrtc(): Promise<void> {
		if (EMULATED_USER_TYPE === EmulatedUserType.KMS) {
			// Implement fake RTCPeerConnection methods, to get media from Kurento.

			await KurentoWebRTC.init('ws://localhost:8888/kurento');

			const globalObject = globalThis as any;
			globalObject.navigator = KurentoWebRTC.navigator;
			globalObject.MediaStream = KurentoWebRTC.MediaStream;
			globalObject.MediaStreamTrack = KurentoWebRTC.MediaStreamTrack;
			globalObject.RTCIceCandidate = KurentoWebRTC.RTCIceCandidate;
			globalObject.RTCPeerConnection = KurentoWebRTC.RTCPeerConnection;
			globalObject.RTCSessionDescription = KurentoWebRTC.RTCSessionDescription;
		} else {
			// Overriding WebRTC API using node-wrtc library with the aim of provide it to openvidu-browser
			// For EmulatedUserType.KMS, this is not necessary due to KMS will implement the WebRTC API itself.
			globalThis.RTCPeerConnection = RTCPeerConnectionWRTC;
			globalThis.RTCIceCandidate = RTCIceCandidateWRTC;
			globalThis.RTCSessionDescription = RTCSessionDescriptionWRTC;
			globalThis.getUserMedia = getUserMediaWRTC;
			globalThis.MediaStream = MediaStreamWRTC;
			globalThis.MediaStreamTrack = MediaStreamTrackWRTC;
			(<any>globalThis.navigator)['mediaDevices'] = mediaDevicesWRTC;
			// globalThis.navigator.mediaDevices = mediaDevicesWRTC;
		}
	}

	platform() {
		platform.name = 'Chrome';
	}

	websocket() {
		globalThis.WebSocket = WebSocket as any;
	}

	openviduBrowser() {
		OpenVidu.OpenVidu = ((original) => {
			OpenVidu.OpenVidu.prototype.checkSystemRequirements = () => {
				return true;
			};
			return OpenVidu.OpenVidu;
		})(OpenVidu.OpenVidu);

		Publisher.Publisher = ((original) => {
			Publisher.Publisher.prototype.initializeVideoReference = PublisherOverride.prototype.initializeVideoReference;
			Publisher.Publisher.prototype.getVideoDimensions = PublisherOverride.prototype.getVideoDimensions;
			return PublisherOverride;
		})(Publisher.Publisher);
	}
	getUserMedia;

	allowSelfSignedCertificate() {
		// Allowed self signed certificate
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	}
}
