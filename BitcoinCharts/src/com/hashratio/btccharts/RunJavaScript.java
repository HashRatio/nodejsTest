package com.hashratio.btccharts;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class RunJavaScript {

   
    public void runScript()throws Exception{
	ScriptEngineManager factory = new ScriptEngineManager();//step 1
        ScriptEngine engine = factory.getEngineByName("JavaScript");//Step 2  
	String script = Tools.loadFileToString("js/test.js");
	engine.eval(script);
    }
    public static void main(String[] args) throws Exception{
	RunJavaScript run = new RunJavaScript();
	run.runScript();
    }
}
