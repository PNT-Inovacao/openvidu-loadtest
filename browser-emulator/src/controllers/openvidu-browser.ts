import * as express from 'express';
import { Request, Response } from 'express';
import { BrowserManagerService } from '../services/browser-manager-service';
import { OpenViduRole } from '../types/openvidu-types';
import { BrowserMode, LoadTestPostRequest, LoadTestPostResponse, TestProperties } from '../types/api-rest-types';

export const app = express.Router({
    strict: true
});

const browserManagerService: BrowserManagerService = new BrowserManagerService();

app.post('/streamManager', async (req: Request, res: Response) => {
	try {

		if(areStreamManagerParamsCorrect(req.body)) {
			let browserMode: BrowserMode = req.body.browserMode || BrowserMode.EMULATE;
			let properties: TestProperties = req.body.properties;
			// Setting default role for publisher properties
			properties.role = properties.role || OpenViduRole.PUBLISHER

			process.env.LOCATION_HOSTNAME = req.headers.host;
			process.env.OPENVIDU_SECRET = req.body.openviduSecret;
			process.env.OPENVIDU_URL = req.body.openviduUrl;

			const response: LoadTestPostResponse = await browserManagerService.createStreamManager(browserMode, properties);

			return res.status(200).send(response);
		}

		console.log('Problem with some body parameter' + req.body);
		return res.status(400).send('Problem with some body parameter');
	} catch (error) {
		console.log("ERROR ", error);
		res.status(500).send(error);

	}
});


app.delete('/streamManager/connection/:connectionId', (req: Request, res: Response) => {
	try {
		const connectionId: string = req.params.connectionId;

		if(!connectionId){
			return res.status(400).send('Problem with connectionId parameter. IT DOES NOT EXIST');
		}
		console.log('Deleting streams with connectionId: ' + connectionId);
		browserManagerService.deleteStreamManagerWithConnectionId(connectionId);
		res.status(200).send({});
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.delete('/streamManager/role/:role', (req: Request, res: Response) => {
	try {
		const role: any = req.params.role;
		if(!role){
			return res.status(400).send('Problem with ROLE parameter. IT DOES NOT EXIST');
		}else if(role !== OpenViduRole.PUBLISHER && role !== OpenViduRole.SUBSCRIBER ){
			return res.status(400).send(`Problem with ROLE parameter. IT MUST BE ${OpenViduRole.PUBLISHER} or ${OpenViduRole.SUBSCRIBER}`);
		}

		console.log('Deleting streams with ROLE:' + role);
		browserManagerService.deleteStreamManagerWithRole(role);
		res.status(200).send({});
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

function areStreamManagerParamsCorrect(request: LoadTestPostRequest): boolean {
	const openviduSecret: string = request.openviduSecret;
	const openviduUrl: string = request.openviduUrl;
	let properties: TestProperties = request.properties;

	const tokenCanBeCreated = !!properties?.userId && !!properties?.sessionName && !!openviduUrl && !!openviduSecret;
	const tokenHasBeenReceived = !!properties?.userId && !!properties?.token;

	return tokenCanBeCreated || tokenHasBeenReceived;
}
