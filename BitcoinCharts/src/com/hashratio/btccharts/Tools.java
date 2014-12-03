package com.hashratio.btccharts;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLClassLoader;

public final class Tools {
    public static String loadFileToString(String fileName) throws Exception{
   	StringBuilder sb = new StringBuilder();
   	URLClassLoader urlLoader =  (URLClassLoader)RunJavaScript.class.getClassLoader();
   	URL fileLoc = urlLoader.findResource(fileName);
   	InputStreamReader reader = new InputStreamReader(new FileInputStream(fileLoc.getFile()));
   	char[] cb = new char[8192];
   	int len = 0;
   	while((len=reader.read(cb))>0){
   	    sb.append(cb, 0, len);
   	}
   	reader.close();
   	return sb.toString();
       }
}
