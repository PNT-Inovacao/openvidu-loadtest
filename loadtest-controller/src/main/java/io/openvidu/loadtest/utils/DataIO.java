package io.openvidu.loadtest.utils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.stream.JsonReader;

import io.openvidu.loadtest.models.testcase.BrowserMode;
import io.openvidu.loadtest.models.testcase.ResultReport;
import io.openvidu.loadtest.models.testcase.TestCase;

@Service
public class DataIO {

	private static ClassLoader classLoader = DataIO.class.getClassLoader();
	private static final String TEST_CASES_JSON_FILE = "test_cases.json";
	private static final String REPORT_FILE_RESULT = "results.txt";

	
	@Autowired
	private JsonUtils jsonUtils;

	public List<TestCase> getTestCasesFromJSON() {
		File file = new File(classLoader.getResource(TEST_CASES_JSON_FILE).getFile());
		JsonArray testCasesList = new JsonArray();

		try {
			JsonReader reader = new JsonReader(new FileReader(file.getAbsolutePath()));
			JsonObject jsonObject = jsonUtils.getJson(reader);
			testCasesList = (JsonArray) jsonObject.get("testcases");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return this.convertJsonArrayToTestCasesList(testCasesList);
	}
	
	public void exportResults(ResultReport result) {

		String RESULT_PATH = new FileSystemResource(REPORT_FILE_RESULT).getFile().getAbsolutePath();

		FileWriter fw;
		try {
			fw = new FileWriter(RESULT_PATH, true);
			BufferedWriter bw = new BufferedWriter(fw);
		    bw.write(result.toString());
		    bw.newLine();
		    bw.newLine();
		    bw.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		System.out.println("Saved result in a " + RESULT_PATH);
	}

	private List<TestCase> convertJsonArrayToTestCasesList(JsonArray array) {

		List<TestCase> testCaseList = new ArrayList<TestCase>();

		for (int i = 0; i < array.size(); i++) {
			JsonObject element = array.get(i).getAsJsonObject();
			boolean headless = false;
			boolean recording = false;
			String typology = element.get("typology").getAsString();
			String sessionsStr = element.get("sessions").getAsString();
			JsonArray participantsArray = (JsonArray) element.get("participants");
			List<String> participants = jsonUtils.getStringList(participantsArray);
			String browserModeStr = element.get("browserMode").getAsString();
			BrowserMode browserMode = browserModeStr.equalsIgnoreCase(BrowserMode.EMULATE.getValue()) ? BrowserMode.EMULATE : BrowserMode.REAL;
			int sessions = sessionsStr.equals("infinite") ? -1 : Integer.parseInt(sessionsStr) ;

			if(browserMode.equals(BrowserMode.REAL)) {
				recording = element.get("recording").getAsBoolean();
				headless = element.get("headless").getAsBoolean();
			}
			testCaseList.add(new TestCase(typology, participants, sessions, browserMode, headless, recording));
		}

		return testCaseList;

	}

}
