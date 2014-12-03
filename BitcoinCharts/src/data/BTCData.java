package data;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.hashratio.btccharts.Tools;

public class BTCData {
    private String dataStr;
    private List<Record> kValueListMinite;
    private Gson gson = new Gson();
    private JsonParser parser = new JsonParser();
    private Calendar calendar = Calendar.getInstance();

    private double high, low = Double.MAX_VALUE;
    private double volumeHigh, volumeLow = Double.MAX_VALUE;

    private Date parseHuobiDate(String dateStr) {
	calendar.set(Calendar.YEAR, Integer.parseInt(dateStr.substring(0, 4)));
	calendar.set(Calendar.MONTH, Integer.parseInt(dateStr.substring(4, 6)));
	calendar.set(Calendar.DAY_OF_MONTH,
		Integer.parseInt(dateStr.substring(6, 8)));
	calendar.set(Calendar.HOUR_OF_DAY,
		Integer.parseInt(dateStr.substring(8, 10)));
	calendar.set(Calendar.MINUTE,
		Integer.parseInt(dateStr.substring(10, 12)));
	return calendar.getTime();
    }

    public BTCData() {
	try {
	    dataStr = Tools.loadFileToString("data/huobi1Min.txt");
	} catch (Exception e) {
	    e.printStackTrace();
	}

	JsonElement ele = parser.parse(dataStr);
	JsonArray array = ele.getAsJsonArray();
	kValueListMinite = new ArrayList<Record>(array.size());
	for (int i = 0; i < array.size(); i++) {
	    JsonArray record = array.get(i).getAsJsonArray();
	    Record r = new Record(parseHuobiDate(record.get(0).getAsString()),
		    record.get(1).getAsDouble(), record.get(2).getAsDouble(),
		    record.get(3).getAsDouble(), record.get(4).getAsDouble(),
		    record.get(5).getAsDouble());
	    if (r.getHigh() > high) {
		high = r.getHigh();
	    }
	    if (r.getLow() < low) {
		low = r.getLow();
	    }
	    if (r.getVolume() > volumeHigh) {
		volumeHigh = r.getVolume();
	    } else if (r.getVolume() < volumeLow) {
		volumeLow = r.getVolume();
	    }
	    kValueListMinite.add(r);
	}
	System.out.println(gson.toJson(kValueListMinite));
    }

    public List<Record> getRecords() {
	return kValueListMinite;
    }

    public double getHigh() {
        return high;
    }

    public void setHigh(double high) {
        this.high = high;
    }

    public double getLow() {
        return low;
    }

    public void setLow(double low) {
        this.low = low;
    }

    public double getVolumeHigh() {
        return volumeHigh;
    }

    public void setVolumeHigh(double volumeHigh) {
        this.volumeHigh = volumeHigh;
    }

    public double getVolumeLow() {
        return volumeLow;
    }

    public void setVolumeLow(double volumeLow) {
        this.volumeLow = volumeLow;
    }
    
}
