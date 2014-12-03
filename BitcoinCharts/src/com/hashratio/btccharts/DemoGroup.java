/*
 * @(#)DemoGroup.java	1.41 06/08/29
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
 * @(#)DemoGroup.java	1.41 06/08/29
 */


package com.hashratio.btccharts;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import javax.swing.JToggleButton;
import javax.swing.border.BevelBorder;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;
import javax.swing.border.SoftBevelBorder;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;


/**
 * DemoGroup handles multiple demos inside of a panel.  Demos are loaded
 * from the demos[][] string as listed in Java2Demo.java.
 * Demo groups can be loaded individually, for example : 
 *      java DemoGroup Fonts
 * Loads all the demos found in the demos/Fonts directory.
 */
public class DemoGroup extends JPanel
    implements MouseListener, ChangeListener, ActionListener {

    /**
     * 
     */
    private static final long serialVersionUID = 3338767502270992430L;

    static int columns = 2;

    private static Font font = new Font("serif", Font.PLAIN, 10);
    private static EmptyBorder emptyB = new EmptyBorder(5,5,5,5);
    private static BevelBorder bevelB = new BevelBorder(BevelBorder.LOWERED);

    private String groupName;
    public JPanel clonePanels[];
    public JTabbedPane tabbedPane;


    public DemoGroup(String name) {

        groupName = name;

        setLayout(new BorderLayout());

        JPanel p = new JPanel(new GridLayout(0,2));
        p.setBorder(new CompoundBorder(emptyB, bevelB));
        add(p);
    }


    public void mouseClicked(MouseEvent e) {

//        if (tabbedPane == null) {
//            shutDown(getPanel());
//            JPanel p = new JPanel(new BorderLayout());
//            p.setBorder(new CompoundBorder(emptyB, bevelB));
//
//            tabbedPane = new JTabbedPane();
//            tabbedPane.setFont(font);
//
//            JPanel tmpP = (JPanel) getComponent(0);
//            tabbedPane.addTab(groupName, tmpP);
//
//            clonePanels = new JPanel[tmpP.getComponentCount()];
//            for (int i = 0; i < clonePanels.length; i++) {
//                clonePanels[i] = new JPanel(new BorderLayout());
//                DemoPanel dp = (DemoPanel) tmpP.getComponent(i);
//                DemoPanel c = new DemoPanel(dp.className);
//                c.setDemoBorder(clonePanels[i]);
//                if (c.surface != null) {
//                    Image cloneImg = DemoImages.getImage("clone.gif", this);
//                    c.tools.cloneB = 
//                        c.tools.addTool(cloneImg,"Clone the Surface",this);
//                    Dimension d = c.tools.toolbar.getPreferredSize();
//                    c.tools.toolbar.setPreferredSize(
//                        new Dimension(d.width+27, d.height));
//                    if (Java2Demo.backgroundColor != null) {
//                        c.surface.setBackground(Java2Demo.backgroundColor);
//                    }
//                } 
//                clonePanels[i].add(c);
//                String s = dp.className.substring(dp.className.indexOf('.')+1);
//                tabbedPane.addTab(s, clonePanels[i]);
//            }
//            p.add(tabbedPane);
//            remove(tmpP);
//            add(p);
//
//            tabbedPane.addChangeListener(this);
//            revalidate();
//        }
//
//        String className = e.getComponent().toString();
//        className = className.substring(0, className.indexOf('['));
//
//        for (int i = 0; i < tabbedPane.getTabCount(); i++) {
//            String s1 = className.substring(className.indexOf('.')+1);
//            if (tabbedPane.getTitleAt(i).equals(s1)) {
//                tabbedPane.setSelectedIndex(i);
//                break;
//            }
//        }

        revalidate();
    }

    public void mousePressed (MouseEvent e) { }
    public void mouseReleased(MouseEvent e) { }
    public void mouseEntered (MouseEvent e) { }
    public void mouseExited  (MouseEvent e) { }


    public void actionPerformed(ActionEvent e) {
        JButton b = (JButton) e.getSource();
        if (b.getToolTipText().startsWith("Clone")) {
        } else {
            removeClone(b.getParent().getParent().getParent().getParent());
        }
    }


    private int index;

    public void stateChanged(ChangeEvent e) {
        shutDown((JPanel) tabbedPane.getComponentAt(index));
        index = tabbedPane.getSelectedIndex();
        setup(false);
    }


    public JPanel getPanel() {
        if (tabbedPane != null) {
            return (JPanel) tabbedPane.getSelectedComponent();
        } else {
            return (JPanel) getComponent(0);
        }
    }


    public void setup(boolean issueRepaint) {

//        JPanel p = getPanel();
//        GlobalControls c = Java2Demo.controls;
//        // .. tools check against global controls settings ..
//        // .. & start demo & custom control thread if need be ..
//        for (int i = 0; i < p.getComponentCount(); i++) {
//            DemoPanel dp = (DemoPanel) p.getComponent(i);
//            if (dp.surface != null && c != null) {
//                Tools t = dp.tools;
//                t.setVisible(isValid());
//                t.issueRepaint = issueRepaint;
//                JToggleButton b[] = {t.toggleB, t.aliasB, t.renderB,
//                               t.textureB, t.compositeB};
//                JCheckBox cb[] = {c.toolBarCB, c.aliasCB, c.renderCB,
//                                  c.textureCB, c.compositeCB};
//                for (int j = 0; j < b.length; j++) {
//                    if (c.obj != null && c.obj.equals(cb[j])) {
//                        if (b[j].isSelected() != cb[j].isSelected()) {
//                            b[j].doClick();
//                        }
//                    } else if (c.obj == null) {
//                        if (b[j].isSelected() != cb[j].isSelected()) {
//                            b[j].doClick();
//                        }
//                    }
//                }
//                t.setVisible(true);
//                if (c.screenCombo.getSelectedIndex() != t.screenCombo.getSelectedIndex()) 
//                {
//                    t.screenCombo.setSelectedIndex(c.screenCombo.getSelectedIndex());
//                }
//                if (Java2Demo.verboseCB.isSelected()) {
//                    dp.surface.verbose();
//                }
//                dp.surface.setSleepAmount(c.slider.getValue());
//                if (Java2Demo.backgroundColor != null) {
//                    dp.surface.setBackground(Java2Demo.backgroundColor);
//                }
//                t.issueRepaint = true;
//            }
//            dp.start();
//        } 
        revalidate();
    }


    public void shutDown(JPanel p) {
        for (int i = 0; i < p.getComponentCount(); i++) {
            ((DemoPanel) p.getComponent(i)).stop();
        } 
        System.gc();
    }



    public void removeClone(Component theClone) {
        JPanel panel = clonePanels[tabbedPane.getSelectedIndex() - 1];
        if (panel.getComponentCount() == 2) {
            Component cmp = panel.getComponent(0);
            panel.removeAll();
            panel.setLayout(new BorderLayout());
            panel.revalidate();
            panel.add(cmp);
        } else {
            panel.remove(theClone);
            int cmpCount = panel.getComponentCount();
            for (int j = 1; j < cmpCount; j++) {
                int top  =  (j+1 >= 3)      ? 0 : 5;
                int left = ((j+1) % 2) == 0 ? 0 : 5;
                EmptyBorder eb = new EmptyBorder(top,left,5,5);
                SoftBevelBorder sbb = new SoftBevelBorder(BevelBorder.RAISED);
                JPanel p = (JPanel) panel.getComponent(j);
                p.setBorder(new CompoundBorder(eb, sbb));
            }
        }
        panel.repaint();
        panel.revalidate();
    }


    public static void main(String args[]) {
        final DemoGroup group = new DemoGroup(args[0]);
        JFrame f = new JFrame("Java2D Demo - DemoGroup");
        f.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) {System.exit(0);}
            public void windowDeiconified(WindowEvent e) { group.setup(false); }
            public void windowIconified(WindowEvent e) { 
                group.shutDown(group.getPanel()); 
            }
        });
        f.getContentPane().add("Center", group);
        f.pack();
        int WIDTH  = 620;
        int HEIGHT = 530;
        f.setSize(WIDTH, HEIGHT);
        f.setLocationRelativeTo(null);  // centers f on screen
        f.setVisible(true);
        group.setup(false);
    }
}
