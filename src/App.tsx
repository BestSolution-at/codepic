import React, { ChangeEvent, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Divider, Layout, Space, Select, Input, Button } from 'antd';

import { elementToSVG, inlineResources } from 'dom-to-svg';
import html2canvas from 'html2canvas';

import './App.css';
import hljs from './highlight.pack.js';

import THEMES from './themes.json'
import { JETBRAINS_MONO_FONT_FACE } from './jetbrains';
import { HACK_FONT_FACE } from './hack';

const { Option } = Select;
const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

function App() {
  return <Layout className="layout">
  <Header>
    <div className="logo" />
    <span style={{color: 'white', fontSize: 32, fontWeight: 'bold'}}>Picture your Code</span>
  </Header>
  <Content style={{ padding: '0 50px' }}>
    <div className="site-layout-content"><AppContent /></div>
  </Content>
  <Footer style={{ textAlign: 'center' }}>BestSolution.at ©2021</Footer>
</Layout>
}

interface Highlight {
  highlightElement: (element: Element) => void
}

interface Theme {
  key: string
  label?: string
}

var a = document.createElement("a");
document.body.appendChild(a);
(a as any).style = "display: none";

const saveBlob = (url: string, filename: string) => {
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function AppContent() {
  const editorRef = useRef<any>();
  const [ highlightText, setHighlightText ] = useState('');
  const [ language, setLanguage ] = useState('java');
  const [ theme, setTheme ] = useState('darcula');
  const [ font, setFont ] = useState('JetBrains Mono')
  const [ width, setWidth ] = useState(800);
  const [ codePadding, setCodePadding ] = useState(15);
  const [ highlightLoaded, setHighlightLoaded ] = useState(true);
  const [ paperColor, setPaperColor ] = useState('');
  const updateText = (e : ChangeEvent<HTMLTextAreaElement>) => {
    setHighlightText(e.target.value)
  }
  const createSVG = async () => {
    const svgString = await editorRef.current.captureSVG();
    const blob = new Blob([svgString],{ type: 'image/svg+xml' });
    var blobUrl = URL.createObjectURL(blob);
    saveBlob(blobUrl,'export.svg');
  }  

  const createPNG = async () => {
    const dataUrl = await editorRef.current.capturePNG();
    saveBlob(dataUrl,'export.png');
  }

  return <div style={{padding: 30, display: 'flex', flexDirection: 'column'}}>
    <link rel="stylesheet" href={"./highlight/styles/"+theme+".css"} />
    <div style={{display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', rowGap: 10}}>
      Language:
      <Select value={language} style={{width: 200}} onChange={setLanguage}>
        { (hljs as any).listLanguages().sort( (a: string,b: string) => a.localeCompare(b) ).map( (e) => <Option value={e}>{e}</Option>) }
      </Select>
      Theme:
      <Space>
        <Select value={theme} style={{width: 200}} onChange={setTheme}>
          { THEMES.map( t => <Option value={t.key}>{t.key}</Option>) }
        </Select>
        <Select value={font} onChange={setFont} style={{width: 200}}>
          <Option value="JetBrains Mono">JetBrains Mono</Option>
          <Option value="Hack">Hack</Option>
        </Select>
      </Space>
      Settings:
        <Space>
          <Input addonBefore="Width" value={width} style={{width: 200}} onChange={ e => {
            const v = Number.parseInt(e.target.value);
            setWidth(Number.isNaN(v) ? 0 : v )
          }} />
          <Input addonBefore="Code-Padding" value={codePadding} style={{width: 200}} onChange={ e => {
            const v = Number.parseInt(e.target.value);
            setCodePadding(Number.isNaN(v) ? 0 : v);
          } } />
          {/*<Input addonBefore="Paper-Color" value={paperColor} style={{width: 200}} onChange={ e => {
            setPaperColor(e.target.value);
          }} />*/}
        </Space>
      <span style={{alignSelf: 'start'}}>Code:</span>
      <TextArea onChange={updateText} style={{minHeight: 150, fontFamily: font}} />
      <span></span>
      <Space>
        <Button onClick={createPNG}>Export PNG</Button>
        <Button onClick={createSVG}>Export SVG</Button>
      </Space>
    </div>
    <Divider />
    { highlightLoaded && <EditorView ref={editorRef} code={highlightText} lang={language} width={width} font={font} codePadding={codePadding} /> }
  </div>
}

let COUNTER = 0;

function EditorView_( props: { lang: string, code: string, width: number, font: string, codePadding: number }, ref ) {
  const tsRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);

  useImperativeHandle( ref, () => ({
    captureSVG : async () => {
      if( snapRef.current ) {
        const svgDocument = elementToSVG( snapRef.current );        
        await inlineResources(svgDocument.documentElement);
        
        

      if( props.font === 'Hack' ) {
        svgDocument.getElementsByTagName("style")[0].innerHTML = HACK_FONT_FACE;
      } else {
        svgDocument.getElementsByTagName("style")[0].innerHTML = JETBRAINS_MONO_FONT_FACE;
      }

        const defs = svgDocument.createElement("defs");
        const filter = svgDocument.createElement("filter");
        filter.setAttribute("id","shadow");
        const feDropShadow = svgDocument.createElement("feDropShadow");
        feDropShadow.setAttribute("dx","0.2");
        feDropShadow.setAttribute("dy","0.4");
        feDropShadow.setAttribute("stdDeviation","0.2");
        filter.appendChild(feDropShadow)
        defs.appendChild(filter);
        svgDocument.documentElement.appendChild(defs);

        return new XMLSerializer().serializeToString(svgDocument)
      }
    },
    capturePNG : async () => {
      if( snapRef.current ) {
        const canvas = await html2canvas( snapRef.current, { backgroundColor: null } );
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(resolve);
        });
        return URL.createObjectURL(blob);
      }
     }
  }) );

  useEffect( () => {
    if( tsRef.current ) {
      hljs && (hljs as any).highlightElement(tsRef.current);
    }
  }, [ tsRef.current ]);

  return <div key={'RENDER_COUNT' + (COUNTER++)} style={{alignSelf: 'center'}}>
    <div ref={snapRef} style={{ paddingLeft: 30, paddingRight: 30, paddingTop: 30, paddingBottom: 30, maxWidth: props.width+30, minWidth: props.width+30 }}>
      <div style={{ borderRadius: 5 }}>
        <pre>
          <code ref={tsRef} className={props.lang} style={{ borderRadius: 5, padding: props.codePadding, paddingTop: 10, fontFamily: props.font, overflow: 'hidden' }}>
            <div style={{ paddingBottom: 5 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="54" height="14" viewBox="0 0 54 14">
                <g fill="none" fillRule="evenodd" transform="translate(1 1)">
                  <circle cx="6" cy="6" r="6" fill="#FF5F56" stroke="#E0443E" strokeWidth=".5" />
                  <circle cx="26" cy="6" r="6" fill="#FFBD2E" stroke="#DEA123" strokeWidth=".5" />
                  <circle cx="46" cy="6" r="6" fill="#27C93F" stroke="#1AAB29" strokeWidth=".5" />
                </g>
              </svg>
            </div>
            {props.code.trim().length === 0 ? 'No Code' : props.code}
          </code>
        </pre>
      </div>
    </div>
  </div>;
}

const EditorView = React.forwardRef(EditorView_);

export default App;
