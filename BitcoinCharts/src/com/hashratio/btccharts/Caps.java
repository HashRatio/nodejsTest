/*
 * @(#)Caps.java	1.27 06/08/29
 * 
 * Copyright (c) 2006 Sun Microsystems, Inc. All Rights Reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * -Redistribution of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 * 
 * -Redistribution in binary form must reproduce the above copyright notice, 
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 * 
 * Neither the name of Sun Microsystems, Inc. or the names of contributors may 
 * be used to endorse or promote products derived from this software without 
 * specific prior written permission.
 * 
 * This software is provided "AS IS," without a warranty of any kind. ALL 
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING
 * ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * OR NON-INFRINGEMENT, ARE HEREBY EXCLUDED. SUN MIDROSYSTEMS, INC. ("SUN")
 * AND ITS LICENSORS SHALL NOT BE LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING THIS SOFTWARE OR ITS
 * DERIVATIVES. IN NO EVENT WILL SUN OR ITS LICENSORS BE LIABLE FOR ANY LOST 
 * REVENUE, PROFIT OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL, 
 * INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY 
 * OF LIABILITY, ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE, 
 * EVEN IF SUN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 * 
 * You acknowledge that this software is not designed, licensed or intended
 * for use in the design, construction, operation or maintenance of any
 * nuclear facility.
 */

/*
 * @(#)Caps.java	1.27 06/08/29
 */


package com.hashratio.btccharts;


import static java.awt.BasicStroke.CAP_BUTT;
import static java.awt.BasicStroke.CAP_ROUND;
import static java.awt.BasicStroke.CAP_SQUARE;
import static java.awt.BasicStroke.JOIN_MITER;
import static java.awt.Color.BLACK;
import static java.awt.Color.WHITE;

import java.awt.BasicStroke;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.font.FontRenderContext;
import java.awt.font.TextLayout;
import java.awt.geom.Line2D;


/**
 * Shows the three different styles of stroke ending.
 */
public class Caps extends Surface {

    /**
     * 
     */
    private static final long serialVersionUID = 7244648583900057330L;
    private static int     cap[] = {  CAP_BUTT,   CAP_ROUND,   CAP_SQUARE  };
    private static String desc[] = { "Butt Cap", "Round Cap", "Square Cap" };


    public Caps() {
        setBackground(WHITE);
    }


    public void render(int w, int h, Graphics2D g2) {
        FontRenderContext frc = g2.getFontRenderContext();
        Font font = g2.getFont();
        g2.setColor(BLACK);
        for (int i=0; i < cap.length; i++) {
            g2.setStroke(new BasicStroke(15, cap[i], JOIN_MITER));
            g2.draw(new Line2D.Float(w/4,(i+1)*h/4,w-w/4,(i+1)*h/4));
            TextLayout tl = new TextLayout(desc[i], font, frc);
            tl.draw(g2,(float)(w/2-tl.getBounds().getWidth()/2),(i+1)*h/4-10);
        }
    }


    public static void main(String s[]) {
        createDemoFrame(new Caps());
    }
}
