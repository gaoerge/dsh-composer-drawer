window.__ModuleLoader__.load({
  id: '@local/dsh-composer-drawer',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const ns = 'local-composer-drawer';
    const css = `
.dsh-composer-drawer {display:flex;justify-content:center;flex:none;width:100%;box-sizing:border-box;padding:0 16px;}
[data-conversation-content][data-content-phase="blank"] .dsh-composer-drawer {display:none;}
.dsh-composer-drawer button {box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;min-width:112px;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:ns-resize;touch-action:none;user-select:none;}
.dsh-composer-drawer button:hover {background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);}
.dsh-composer-drawer button:focus-visible {outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}
.dsh-composer-drawer-grip {display:block;width:24px;height:3px;border-radius:3px;background:currentColor;opacity:.65;}
[data-composer-seat]:has(.dsh-composer-drawer[data-collapsed="true"]) [data-composer-card] {display:none !important;}
[data-conversation-content][data-content-phase="blank"] [data-composer-seat]:has(.dsh-composer-drawer) [data-composer-card] {display:flex !important;}
`;
    function Drawer(props) {
      const [collapsed, setCollapsed] = React.useState(false);
      const gesture = React.useRef(null);
      const suppressClick = React.useRef(false);
      const sessionId = props.sessionId;
      React.useEffect(() => { setCollapsed(false); gesture.current = null; }, [sessionId]);
      function down(e) {
        if (e.button !== 0 || !e.isPrimary) return;
        gesture.current = {id:e.pointerId, y:e.clientY, collapsed, moved:false};
        suppressClick.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      function move(e) {
        const g = gesture.current;
        if (!g || e.pointerId !== g.id) return;
        if (Math.abs(e.clientY-g.y)>6) g.moved=true;
        if (g.moved) e.preventDefault();
      }
      function up(e) {
        const g = gesture.current;
        if (!g || e.pointerId !== g.id) return;
        const delta=e.clientY-g.y;
        gesture.current=null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        if (g.moved) {
          suppressClick.current=true;
          if (delta>18) setCollapsed(true);
          else if (delta < -18) setCollapsed(false);
        }
      }
      function cancel(e) {
        if (e.pointerId !== gesture.current?.id) return;
        gesture.current = null;
        suppressClick.current = false;
      }
      const label=props.t(collapsed ? 'expand' : 'collapse');
      return h('div', {className:'dsh-composer-drawer','data-collapsed':String(collapsed)},
        h('style',null,css),
        h('button', {type:'button', 'aria-label':label, 'aria-expanded':!collapsed,
          title:props.t('hint'),
          onPointerDown:down,onPointerMove:move,onPointerUp:up,
          onPointerCancel:cancel,
          onLostPointerCapture:cancel,
          onClick:()=>{if(suppressClick.current){suppressClick.current=false;return;}setCollapsed(v=>!v);},
          onKeyDown:(e)=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();setCollapsed(e.key==='ArrowDown');}}
        },h('span',{className:'dsh-composer-drawer-grip','aria-hidden':true}),h('span',null,label))
      );
    }
    return {
      inject:['slots','locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(ns, {
          zh: {collapse:'收起输入框',expand:'展开输入框',hint:'向下拖动收起，向上拖动展开；也可点击或使用方向键'},
          en: {collapse:'Hide composer',expand:'Show composer',hint:'Drag down to hide, drag up to show; or click or use arrow keys'}
        }), 'composer-drawer: dictionaries');
        ctx.slots.inject('conversation.input.dock',()=>ctx.slots.register({
          name:'conversation.input.dock', id:'local-composer-drawer', order:1000, locale:ns
        }, Drawer));
      }
    };
  }
});
