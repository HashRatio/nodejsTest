import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.GraphicsEnvironment;
import java.awt.Rectangle;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.swing.JFrame;
import javax.swing.JPanel;

import com.idquantique.quantis.Quantis;
import com.idquantique.quantis.QuantisException;

public class RandomStudy {

    
    private static final int HANZI_COUNT = 0x9fbb-0x4e00;
    private static final int HANZI_START = 0x4e00;
    private static Map<String,String> MAP = null;
//    private static char[] HANZI_CHARS = null;
    private static char[] HANZI_CHARS = null;
    private static int HANZI_CHARS_LEN = 0;
    private JFrame jframe = new JFrame();
    private JPanel drawPanel = new MyPanel();
    static class Data{
	long time;
	int value;
	Data(long time, int value){
	    this.time = time;
	    this.value = value;
	}
    }
    String newPoem = null;
    
    
    private LinkedList<Data> pointList = new LinkedList<Data>();
    int width,height;
    int maxPosPoint = 0;
    int maxNegPoint = 0;
    class MyPanel extends JPanel{
	/**
	 * 
	 */
	private static final long serialVersionUID = 7061488790086486388L;
	Font dialog = null;
	
	MyPanel(){
//	    GraphicsEnvironment ge = 
//	            GraphicsEnvironment.getLocalGraphicsEnvironment();
//	    dialog = ge.getAllFonts()[2];
	    dialog = Font.decode("微软雅黑");
	    dialog = dialog.deriveFont(Font.PLAIN,40);
	}
	int yOffset = 0;
	void drawGrid(Graphics gc){
	    gc.setColor(Color.WHITE);
	    gc.drawLine(baseX, baseY+ yOffset , baseX + 1920, baseY+ yOffset );
	    for (int i = 0; i < 10; i++) {
		gc.drawString(""+i*100, 0, baseY+ i*100+ yOffset );
		gc.drawLine(0, baseY+ i*100+ yOffset , width, baseY+ i*100+ yOffset );
		gc.drawString("-"+i*100, 0, baseY- i*100+ yOffset );
		gc.drawLine(0, baseY-i*100+ yOffset , width, baseY-i*100+ yOffset );
	    }
	}
	
	void drawLines(Graphics gc,  List<Data> pointList){
	    Data lastP = null;
	    int y = pointList.get(0).value;
	    if(y >400){
		yOffset = -(y-400);
	    }else if(y<-400){
		yOffset = -(y+400);
	    }
	    int x = 0;
	    drawGrid(gc);
	    drawMax(gc);
	    gc.setColor(Color.RED);
	    synchronized (pointList) {
		for (Data p : pointList) {
		    if (lastP != null) {
			gc.drawLine(x, baseY + yOffset + lastP.value, x+=10, baseY + yOffset + p.value);
		    }
		    lastP = p;
		}
	    }
	}
	
	void drawMax(Graphics gc){
	    gc.setColor(Color.GREEN);
	    if(maxPosPoint!=0){
		gc.drawString(""+maxPosPoint, 0, baseY+ maxPosPoint+ yOffset);
		gc.drawLine(0, baseY+ maxPosPoint+ yOffset, width, baseY+ maxPosPoint+ yOffset);
	    }
	    if(maxNegPoint!=0){
		gc.drawString(""+maxNegPoint, 0, baseY+ maxNegPoint + yOffset);
		gc.drawLine(0, baseY+ maxNegPoint+ yOffset, width, baseY+ maxNegPoint + yOffset);
	    }
	}
	
	
	public void paint(Graphics gc) {
	    super.paint(gc);
	    gc.setColor(Color.BLACK);
	    gc.fillRect(0, 0, 1920, 1080);
	    gc.setColor(Color.WHITE);
	    gc.setFont(dialog);
	    drawPeoms(gc);
	    drawLines(gc, pointList);
	}
	public void drawPeoms(Graphics gc){
	    int x = 0;
	    synchronized (poems) {
		for (String poem : poems) {
		    gc.drawString(poem, x += 274, 100);
		}
	    }
	}
	
	 public void update(Graphics g) {
	    paint(g);
	}

    }
    
    private static final Quantis quantis;
    private static final int MAX_SIZE = 150;
    static{
	quantis = new Quantis(Quantis.QuantisDeviceType.QUANTIS_DEVICE_USB, 0);
    }
    
    static void loadChangYongChars()throws Exception{
	File file = new File("changyong.txt");
	InputStreamReader reader = new InputStreamReader(
		new FileInputStream(file), "utf-8");
	HANZI_CHARS = new char[(int)file.length()];
	HANZI_CHARS_LEN = reader.read(HANZI_CHARS);
	System.out.println("read Len:" + HANZI_CHARS_LEN);
    }
    static{
	try{
	    loadChangYongChars();
	}catch (Exception e){
	    e.printStackTrace();
	}
    }
    
    
    long timeStart;
    int baseX, baseY;
    void initWindow(){
	drawPanel.setBounds(0, 0, 1920, 1080);
	width = drawPanel.getWidth();
	height = drawPanel.getHeight();
	jframe.setContentPane(drawPanel);
	jframe.setBounds(0, 0, width, height);
	jframe.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	jframe.setVisible(true);
	baseX = 0;
	baseY = 1080/2;
	Rectangle rect = drawPanel.getBounds();
	System.out.println("Rect: " + rect);
    }
    
    LinkedList<String> poems = new LinkedList<String>();
    
    char[] poem = new char[5];
    
  
    void plot(int num, double randNum){
	if(num>maxPosPoint){
	    maxPosPoint = num;
	    poemStart = true;
	    poemPos = 0;
	}
	
	if(num<maxNegPoint){
	    maxNegPoint = num;
	    poemStart = true;
	    poemPos = 0;
	    
	}
	
	if(poemStart){
	    poem[poemPos++] = getChar(randNum);
	    if(poemPos==5){
		poemStart = false;
		synchronized (poems) {
		    poems.add(new String(poem));
		    if (poems.size() > 7) {
			poems.removeFirst();
		    }
		}
	    }
	}
	
	synchronized(pointList){
	    pointList.add(new Data(System.currentTimeMillis(),num));
	    if (pointList.size() > MAX_SIZE) {
		pointList.remove(0);
	    }
	}
	drawPanel.repaint();
    }
    /**
     * @param args
     */
    public static void main(String[] args) throws Exception {
	RandomStudy study = new RandomStudy();
	int group = 10;
	study.initWindow();
	for(;;){
	    study.getCulmulativeNum(group);
	}
//	study.getPy("你好大家好");
//	System.out.println(HANZI_CHARS + "Len:" + HANZI_CHARS.length);
//	study.getRandomHanzi("SeduRandomHanziPinyin5.txt",10000000,5);
//	study.getQuantiRandomHanzi("QuatiRandomHanzi.txt", 8192);
//	study.printHanzi("hanzi.txt");
//	 study.t2();
//	study.testSeduRandom("SeduRandom.txt");
//	study.testQuantiRandom1("TrueRandom1.txt");
//	study.testQuantiRandom2("TrueRandom2.txt");
    }
    private static int cum = 0;
    boolean poemStart = false;
    int poemPos = 0;
    private void getCulmulativeNum(int group) throws QuantisException {
	double randNum = quantis.ReadFloat();
//	double randNum = Math.random();
	if (randNum > 0.5) {// quantis.ReadInt() > 0
	    cum++;
	} else {
	    cum--;
	}
//	System.out.println(cum);
	plot(cum,randNum);
//	try {
//	    Thread.sleep(1);
//	} catch (InterruptedException e) {
//	}
    }

    private void printHanziChars() throws Exception{
	String pinyin = getPy("你好大家好");
	System.out.println(HANZI_CHARS);
    }

    
    public static String getPy(String chs) throws Exception {
	String py = null;
	StringBuffer sb = new StringBuffer();
	try {
	    String fileName = "py.txt";
	    if (MAP == null) {
		InputStream ins = new FileInputStream(fileName);
		MAP = new HashMap<String, String>();
		BufferedReader br = new BufferedReader(new InputStreamReader(
			ins, "utf-8"));
		while (true) {
		    String str = br.readLine();
		    if (str == null) {
			break;
		    }
		    String[] strs = str.split(" ");
		    if (strs.length == 2) {
			MAP.put(strs[0], strs[1]);
		    }
		}
//		HANZI_CHARS = new char[MAP.size()];
//		int idx = 0;
//		for(String key:MAP.keySet()){
//		    HANZI_CHARS[idx++] = key.charAt(0);
//		}
	    }
	    String key, value;
	    for (int i = 0; i < chs.length(); i++) {
		key = chs.substring(i, i + 1);
		if (key.getBytes("GB2312").length == 2) {
		    value = (String) MAP.get(key);
		    if (value == null) {
			value = "XX";
		    }
		} else {
		    value = key;
		}
		sb.append(value).append(" ");
	    }
	    py = sb.toString();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	return py.toUpperCase();
    }
    public void testSeduRandom(String fileName) throws Exception {
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName)));
	for (int i = 0; i < 1; i++) {
	    char cb[] = new char[8192];
	    for (int j = 0; j < 8192; j++) {
		cb[j] = getSeduRandom();
	    }
	    bw.write(cb);
	}
	bw.close();
    } 
    
    public void getRandomHanzi(String fileName, int count, int ident) throws Exception {
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName)));
	int line = count / ident;
	for (int i = 0; i < line ; i++) {
	    StringBuilder py = new StringBuilder();
	    for(int j=0;j<ident;j++){
		char c = getSeduRandomHanzi2();
	    	bw.write(c);
	    	py.append(" ").append(getPy(""+c));
	    }
	    bw.write(py.toString());
	    bw.write("\r\n");
	    bw.flush();
	}
	bw.close();
    }
    
    public void getQuantiRandomHanzi(String fileName, int count) throws Exception {
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName)));
	int rolls = count / 8192;
	int len = count % rolls;
	char cb[] = new char[8192];
	for (int i = 0; i < rolls ; i++) {
	    for (int j = 0; j < 8192; j++) {
		cb[j] = getQuantiRandomHanzi2();
	    }
	    bw.write(cb);
	}
	
	for (int i = 0; i < len ; i++) {
	    cb[i] = getQuantiRandomHanzi2();
	}
	bw.write(cb, 0 ,len);
	bw.close();
    }
    
    /**
     * Speed: 1000:273
		2000:270
     * @param fileName
     * @throws Exception
     */
    public void testQuantiRandom1(String fileName) throws Exception {
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName)));
	long num = 0;
	long start = System.currentTimeMillis();
	for (int i = 0; i < 1; i++) {
	    char cb[] = new char[8192];
	    for (int j = 0; j < 8192; j++) {
		cb[j] = getQuantiRandom();
		num++;
		if(num % 1000==0){
		    long now = System.currentTimeMillis();
		    System.out.println(num + ":" + num*1000/(now-start));
		}
	    }
	    bw.write(cb);
	}
	bw.close();
    }
    
    /**
     * Speed: 
     * 53000:1230
54000:1227
55000:1226
56000:1228
57000:1228
     * @param fileName
     * @throws Exception
     */
    public void testQuantiRandom2(String fileName) throws Exception {
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName)));
	long num = 0;
	long start = System.currentTimeMillis();
	char cb[] = new char[8192];
	for (int i = 0; i < 1; i++) {
	    for (int j = 0; j < 8192; j+=4) {
		getQuantiRandom2(cb,j);
		num+=4;
		if(num % 1000==0){
		    long now = System.currentTimeMillis();
		    System.out.println(num + ":" + num*1000/(now-start));
		}
	    }
	    bw.write(cb);
	    bw.flush();
	}
	bw.close();
    }
    
    char getSeduRandom(){
	int num = (int)(27 * Math.random());
	return num < 26? (char) ('a' + num): '\n' ;
    }
    
    char getSeduRandomHanzi(){
	return (char)(HANZI_START+(HANZI_COUNT * Math.random()));
    }
    
    char getQuantiRandom() throws Exception{
	int num = quantis.ReadInt(0, 26);
	return num < 26? (char) ('a' + num): '\n' ;
    }
    
    char getQuantiRandomHanzi() throws QuantisException{
	return (char)(HANZI_START+(HANZI_COUNT * quantis.ReadDouble()));
    }
    
    char getChar(double randNum){
	return HANZI_CHARS[(int)(randNum*HANZI_CHARS_LEN)];
    }
    
    char getQuantiRandomHanzi2() throws QuantisException{
	return HANZI_CHARS[(int)(quantis.ReadDouble()*HANZI_CHARS_LEN)];
    }
    
    char getSeduRandomHanzi2() throws QuantisException{
	return HANZI_CHARS[(int)(Math.random()*HANZI_CHARS_LEN)];
    }
    
    void getQuantiRandom2(char[]cb, int idx) throws Exception{
	int num = quantis.ReadInt();
	int nums[] = new int[4];
	nums[0] = num & 0xff;
	nums[1] = num>>8 & 0xff;
	nums[2] = num>>16 & 0xff;
	nums[3] = num>>32 & 0xff;
	for (int i = 0; i < 4; i++) {
	    cb[idx+i] = (char)( 'a' + trim(nums[i]));
	}
//	return num < 26? (char) ('a' + num): '\n' ;
    }
    
    int trim(int num){
	return num % 26;
    }
    
    void printHanzi(String fileName) throws Exception{
	BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(
		new FileOutputStream(fileName),"UTF-8"));
	bw.write("start\r\n");
	for (int i=0x4e00;i<0x9fff;i++){
//	    char c = (char)i;
	    bw.write((char)i + "," + Integer.toHexString(i) + "\r\n");
	}
	bw.flush();
	bw.close();
	System.out.println("Count:" + (0x9fff-0x4e00));
	System.out.println('我'+":" + (int)'我'); //0x6211
    }

    void t2() {
//	for (int j = 0; j < 26; j++) {
//	    System.out.print((char) ('a' + j));
//	}
//	System.out.println();
	for (int j = 0; j < 500; j++) {
	    System.out.print(getSeduRandom());
	}
//	System.out.println('{'-'a');
    }

}
