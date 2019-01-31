            if((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y) <= (ControlPointView.Radius+2) * (ControlPointView.Radius+2))
                return ControlHoverType.ControlHoverType_Self;
            }
            else
            {
                if(this.mIsSelected == false){
                    return ControlHoverType.ControlHoverType_None;
                }
                if((x-this.mControlNextPoint.x)*(x-this.mControlNextPoint.x)+(y-this.mControlNextPoint.y)*(y-this.mControlNextPoint.y) <= (ControlPointView.Radius+2) * (ControlPointView.Radius+2)){
                    return ControlHoverType.ControlHoverType_LastControlDot;
                }
                else if((x-this.mControlLastPoint.x)*(x-this.mControlLastPoint.x)+(y-this.mControlLastPoint.y)*(y-this.mControlLastPoint.y) <= (ControlPointView.Radius+2) * (ControlPointView.Radius+2)){
                    return ControlHoverType.ControlHoverType_NextControlDot;
                }else{
                    return ControlHoverType.ControlHoverType_None;
                }
            }




// TypeScript file


module editor{


    //�����ͣ���Ƶ������;
    enum ControlHoverType{
        ControlHoverType_None = 0,
        ControlHoverType_Self = 1,                  //��ͣ���Լ���������Ҫ�ƶ��㱾��;
        ControlHoverType_LastControlDot = 2,        //��ͣǰ���Ƶ㣬 ��Ҫ�ƶ�����ǰ���;
        ControlHoverType_NextControlDot = 3         //��ͣ����Ƶ㣬 ��Ҫ�ƶ����ƺ���;
    }

    //���Ƶ�;
    class ControlPointView extends eui.Group{
        //���Ƶİ뾶;
        private static Radius:number = 5;        
        //���ƿ��Ƶ���ɫ.
        private static CTRL_FLAG_COLOR:number = 0xFFff00;
        //ѡ����ɫ.
        private static SELECT_FLAG_COLOR:number = 0xffffff;
        //��ʼ��ɫ.
        private static BEGIN_FLAG_COLOR:number = 0x00ffff;

        //���Ʊ�Բ����ɫ(��ɫ)
        private static CONTROL_DOT_COLOR:number = 0x00ff00;
        //�����ߵ���ɫ
        private static CONTROL_LINE_COLOR:number = 0xff00ff;

        //���Ƶ���Ƶ���״;
        public mShape:egret.Shape;
        //ѡ�е�
        private mSelectShape:egret.Shape;
        //��ʼ��ʶ;
        private mBeginShape:egret.Shape;

        //������һ���ڵ����;
        public mLastLine:egret.Shape;

        //ǰһ�����Ƶ�;
        private lastCtrlPoint:ControlPointView = null;
        private nextCtrlPoint:ControlPointView = null;
        
        private mIsTouching = false;
        private mIsSelected:boolean = false;

        //����Ƶ�;
        private mControlNextPoint:egret.Point;
        //ǰ���Ƶ�;
        private mControlLastPoint:egret.Point;
        //���Ƶ��ƫ��ֵ;
        private mControlPointOffset:egret.Point = new egret.Point(0, 0);

        //��ǰһ����Ŀ�����
        private mControlLastLine:egret.Shape;
        //���һ����Ŀ�����
        private mControlNextLine:egret.Shape;

        //������ǰ��Ķ˵�
        private mControlLastDot:egret.Shape;
        //�����ߺ���Ķ˵�
        private mControlNextDot:egret.Shape;

        //�����ͣ��״̬;
        private hoverType:ControlHoverType = ControlHoverType.ControlHoverType_None;

        public static distanceSqrPtToLine(p:{x,y}, q:{x,y},pt:{x,y}):{distSqr:number, lineX:number, lineY:number}{
            let pqx = q.x - p.x;
            let pqy = q.y - p.y;
            let dx = pt.x - p.x;
            let dy = pt.y - p.y;
            let d = pqx * pqx + pqy * pqy;
            let t = pqx * dx + pqy * dy;
            if(d>0){
                t = t / d;
            }
            if(t<0){
                t = 0;
            }else if(t>1){
                t = 1;
            }

            let lx = p.x + t * pqx;
            let ly = p.y + t * pqy;

            let ptx = pt.x - lx;
            let pty = pt.y - ly;

            let distSquare = ptx * ptx + pty * pty;
            return {distSqr:distSquare, lineX:lx, lineY:ly};
        }

        //����;
        constructor(x:number,y:number,type?, ctrlOffsetX:number=0, ctrlOffsetY:number=0){
            super();
            //��¼����
            this.x = x;
            this.y = y;
            //��¼���Ƶ�;
            this.mControlPointOffset = new egret.Point(ctrlOffsetX, ctrlOffsetY);
            this.updateControlPoint();
            this.mShape = this.newCircle(ControlPointView.CTRL_FLAG_COLOR, ControlPointView.Radius);
            this.mSelectShape = this.newSelectCircle(ControlPointView.SELECT_FLAG_COLOR, ControlPointView.Radius+2 );
            this.mBeginShape = this.newSelectCircle(ControlPointView.BEGIN_FLAG_COLOR, ControlPointView.Radius+4 );
            this.addChild(this.mBeginShape);
            this.mBeginShape.visible = false;
            this.addChild(this.mSelectShape);
            this.mSelectShape.visible = false;
            this.mLastLine = null;
            this.addChild(this.mShape);
            this.touchEnabled = false;
            if(type){
                this.mShape.visible = false;
            }

        }

        //���¿��Ƶ�����;
        protected updateControlPoint(){
            this.mControlNextPoint = new egret.Point(this.x + this.mControlPointOffset.x, this.y + this.mControlPointOffset.y);
            this.mControlLastPoint = new egret.Point(this.x - this.mControlPointOffset.x, this.y - this.mControlPointOffset.y);
            this.drawControlLines();
        }

        protected drawControlLines(){
            if(this.mControlLastLine != null){
                this.removeChild(this.mControlLastLine);
                this.mControlLastLine = null;
            }
            //����ǰһ�����Ƶ㣻
            this.mControlLastLine = this.newLine(this.mControlLastPoint, new egret.Point(this.x, this.y), false, ControlPointView.CONTROL_LINE_COLOR);
            this.mControlLastLine.x = -this.x;
            this.mControlLastLine.y = - this.y;
            this.addChildAt(this.mControlLastLine, 0);


            if(this.mControlLastLine != null){
                this.removeChild(this.mControlLastLine);
                this.mControlLastLine = null;
            }            
            //���ƺ�һ�����Ƶ�;
            this.mControlNextLine = this.newLine(new egret.Point(this.x, this.y), this.mControlNextPoint, false, ControlPointView.CONTROL_LINE_COLOR);
            this.addChildAt(this.mControlNextLine, 0);

            if(this.mControlLastDot != null){
                this.removeChild(this.mControlLastDot);
                this.mControlLastDot = null;   
            }
            this.mControlLastDot = this.newCircle(ControlPointView.CONTROL_DOT_COLOR, ControlPointView.Radius);
            this.mControlLastDot.x = - this.x;
            this.mControlLastDot.y = - this.y;
            this.addChildAt(this.mControlLastDot, 0);


            if(this.mControlNextDot != null){
                this.removeChild(this.mControlNextDot);
                this.mControlNextDot = null;   
            }
            this.mControlNextDot = this.newCircle(ControlPointView.CONTROL_DOT_COLOR, ControlPointView.Radius);
            this.mControlNextDot.x = - this.x;
            this.mControlNextDot.y = - this.y;
            this.addChildAt(this.mControlNextDot, 0);
        }

        public onTouchBegin(touchEvent:egret.TouchEvent){
            this.mIsTouching = true;
        }

        public onTouchMove(touchEvent:egret.TouchEvent){
            if(this.mIsTouching == false){
                return;
            }
            let newPos = this.parent.globalToLocal(touchEvent.stageX, touchEvent.stageY)
            this.x = newPos.x;
            this.y = newPos.y;
            this.refreshConnectLines();
        }

        public onTouchCancel(touchEvent:egret.TouchEvent){
            this.mIsTouching = false;
        }

        public onTouchReleaseOutside(touchEvent:egret.TouchEvent){
            this.mIsTouching = false;
        }

        public onTouchEnd(touchEvent:egret.TouchEvent){
            let newPos = this.parent.globalToLocal(touchEvent.stageX, touchEvent.stageY)
            this.x = newPos.x;
            this.y = newPos.y;
            this.refreshConnectLines();
            this.mIsTouching = false;
        } 
                      
        public isHover(x, y){
            return (x-this.x)*(x-this.x)+(y-this.y)*(y-this.y) <= (ControlPointView.Radius+2) * (ControlPointView.Radius+2);
        }


        //������ͣ�ڿ��Ƶ��ϣ�0������û����ͣ��-1:������ͣ����ǰ�Ŀ��Ƶ��ϣ� 1:������ͣ�����Ŀ��Ƶ���.
        public getHoverType(x, y):ControlHoverType{

        }

        //��������ϣ��򷵻�hoverΪtrue�� x, yΪʵ���ߵĵ㣻����������ϣ���hoverΪfalse;
        public getHoverLine(x, y, maxDistance:number):{hover:boolean,x:number,y:number}{
            if(this.lastCtrlPoint == null){
                return {hover:false,x:0,y:0};
            }
            let distInfo = ControlPointView.distanceSqrPtToLine({x:this.x, y:this.y},
                                                                {x:this.lastCtrlPoint.x, y:this.lastCtrlPoint.y},
                                                                {x:x,y:y});
            if(distInfo.distSqr < maxDistance * maxDistance){
                return {hover:true, x:distInfo.lineX, y:distInfo.lineY};
            }
            return {hover:false,x:0,y:0};
        }

        private isFirstPoint():boolean{
            return this.lastCtrlPoint == null;
        }

        public getNextCtrl():ControlPointView{
            return this.nextCtrlPoint;
        }

        public getLastCtrl():ControlPointView{
            return this.lastCtrlPoint;
        }

        public refreshConnectLines(type?){
            this.refreshLastLine(type);
            if(this.nextCtrlPoint != null){
                this.nextCtrlPoint.refreshLastLine(type);
            }
        }

        public refreshLastLine(type?){
            if(this.mLastLine != null){
                this.removeChild(this.mLastLine);
                this.mLastLine = null;
            }
            if(this.lastCtrlPoint != null){
                this.mLastLine = this.newLine(new egret.Point(this.lastCtrlPoint.x, this.lastCtrlPoint.y),
                    new egret.Point(this.x, this.y),type);
                this.mLastLine.x = -this.x;
                this.mLastLine.y = - this.y;
                this.addChild(this.mLastLine);
            }
        }

        public setSelected(selected:boolean){
            this.mIsSelected = selected;
            this.refreshState();
        }

        public refreshState(){
            this.mSelectShape.visible = this.mIsSelected;
            this.mBeginShape.visible = this.isFirstPoint();
        }

        protected newSelectCircle(color:number, radius:number):egret.Shape{
            let shp = new egret.Shape();
            shp.graphics.lineStyle(1, color);
            shp.graphics.drawCircle(0,0,radius);
            shp.blendMode = egret.BlendMode.ADD;
            return shp;   
        }

        protected newCircle(color:number, radius:number):egret.Shape{
            let shp = new egret.Shape();
            shp.graphics.lineStyle(1, color);
            shp.graphics.beginFill(color, 1);
            shp.graphics.drawCircle(0,0,radius);
            shp.graphics.endFill();
            shp.blendMode = egret.BlendMode.ADD;
            return shp;
        }

        protected newLine(fromPt, dstPt,type?, color:number=0xff0000, lineBold:number=2):egret.Shape{
            let line: egret.Shape = new egret.Shape();
            line.graphics.lineStyle(lineBold, type?0x0037FF:color);
            line.graphics.moveTo(fromPt.x, fromPt.y);
            line.graphics.lineTo(dstPt.x, dstPt.y);
            line.x = 0;
            line.y = 0;
            // line.alpha = 0.5;
            return line;      
        }


        public setLastControl(ctrlPoint:ControlPointView){
            this.lastCtrlPoint = ctrlPoint;
            this.refreshLastLine();
        }


        public setNextControl(ctrlPoint:ControlPointView){
            this.nextCtrlPoint = ctrlPoint;
        }

        //�����ߵ��˾�...
        protected GetGlowFilter(color: number, strength:number = 1): egret.GlowFilter {
            var color: number = color;        /// ���ε���ɫ��ʮ�����ƣ�������͸����
            var alpha: number = 0.8;             /// ���ε���ɫ͸���ȣ��Ƕ� color ������͸�����趨����ЧֵΪ 0.0 �� 1.0�����磬0.8 ����͸����ֵΪ 80%��
            var blurX: number = 10;              /// ˮƽģ��������ЧֵΪ 0 �� 255.0�����㣩
            var blurY: number = 10;              /// ��ֱģ��������ЧֵΪ 0 �� 255.0�����㣩
            var strength: number = 1;            /// ѹӡ��ǿ�ȣ�ֵԽ��ѹӡ����ɫԽ����ҷ����뱳��֮��ĶԱȶ�ҲԽǿ����ЧֵΪ 0 �� 255����δʵ��
            var quality: number = egret.BitmapFilterQuality.MEDIUM;        /// Ӧ���˾��Ĵ����������� BitmapFilterQuality ��ĳ���������
            var inner: boolean = false;            /// ָ�������Ƿ�Ϊ�ڲ෢�⣬��δʵ��
            var knockout: boolean = false;            /// ָ�������Ƿ�����ڿ�Ч������δʵ��
            var glowFilter: egret.GlowFilter = new egret.GlowFilter(color, alpha, blurX, blurY,
                strength, quality, inner, knockout);
            return glowFilter;
        }

    };


    //��������;
    class OperTouchControlCmd{
        public cmd:string;//��������;
        public ctrl:ControlPointView;
        public param:any;
        protected newPos:{x,y};
        protected parent:any;
        constructor(cmd:string, ctrl:ControlPointView, param=null){
            this.cmd = cmd;
            this.ctrl = ctrl;
            this.param = param;
            this.parent = this.ctrl.parent;
            this.newPos = {x:ctrl.x,y:ctrl.y};
        }

        //ִ������;
        public redo(){
            if(this.cmd == "addNewCtrl"){
                if(this.ctrl.getLastCtrl() != null){
                    this.ctrl.getLastCtrl().setNextControl(this.ctrl);
                }
                if(this.ctrl.getNextCtrl() != null){
                    this.ctrl.getNextCtrl().setLastControl(this.ctrl);
                }
            }
        }

        //��������;
        public cancel(){
            if(this.cmd == "addNewCtrl"){
                LineEditorView.Instance.deleteSelectPoint(this.ctrl);
            }else if(this.cmd == "moveCtrl"){
                this.ctrl.x = this.param.x;
                this.ctrl.y = this.param.y;
            }
        }
    }

    //�����ߵı༭����
    export class LineEditorView extends eui.Group{
        public static s_IsTouchControlPoint:boolean = false;
        public static s_horizonOffset:number = 50;
        public static s_vertialOffset:number = 50;

        public static s_Instance:LineEditorView;

        public operCmdList:Array<OperTouchControlCmd>;

        public static get Instance(){
            return LineEditorView.s_Instance;
        }

        constructor(width:number, height:number){
            super();
            this.width =  width  + 2*LineEditorView.s_horizonOffset; 
            this.height = height + 2*LineEditorView.s_vertialOffset;
            this.anchorOffsetX = LineEditorView.s_horizonOffset;
            this.anchorOffsetY = LineEditorView.s_vertialOffset;
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchReleaseOutside, this);
            LineEditorView.s_Instance = this;
            this.operCmdList = new Array<OperTouchControlCmd>();
        }

        //���ƵĿ�ʼ�ڵ�;
        public mHeadCtrlView:ControlPointView = null;
        public mHeadCtrlViewNew:ControlPointView = null;
        //���ƵĽ����ڵ�;
        public mTailCtrlView:ControlPointView = null;
        public mTailCtrlViewNew:ControlPointView = null;

        //������ʼ;
        private mSelectCtrlPoint:ControlPointView = null;

        private mSelectCtrlPointNew:ControlPointView = null;

        private mTouchBeginPos:{x,y};
        protected onTouchBegin(event:egret.TouchEvent){
            let newPos = this.globalToLocal(event.stageX, event.stageY)
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
                this.mSelectCtrlPoint = null;
            }
            this.mSelectCtrlPoint = this.getHoverControlPoint(newPos.x, newPos.y);
            this.mTouchBeginPos = newPos;
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchBegin(event);
                this.mSelectCtrlPoint.setSelected(true);
                return;
            }

            //��������ϣ������������·��;
            let hoverLineInfo = this.getHoverCtontrolLine(newPos.x, newPos.y, 5);
            if(hoverLineInfo.CtrlPt != null){
                this.addNewCtrlFromLine(hoverLineInfo.CtrlPt, hoverLineInfo.x, hoverLineInfo.y);
                this.mSelectCtrlPoint.onTouchBegin(event);
                return;
            }
            this.addNewControlPoint(newPos.x, newPos.y);
            this.mSelectCtrlPoint.onTouchBegin(event);
        }

        //���һ���µ�;
        protected addNewControlPoint(x, y):ControlPointView{
            let newCtrl = new ControlPointView(x, y);
            this.addChild(newCtrl);
            this.addCtrlToList(newCtrl);
            this.refreshAllCtrlState();  
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
                this.mSelectCtrlPoint = null;
            }
            this.mSelectCtrlPoint = newCtrl;  
            this.mSelectCtrlPoint.setSelected(true);
            this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
            return newCtrl;
        }


        //��ӵ��ӵ�
         protected addNewControlPointNew(x, y,panel):ControlPointView{
            let newCtrl = new ControlPointView(x, y,true);
            newCtrl.touchEnabled = false;
            newCtrl.alpha = 0.3;
            panel.addChild(newCtrl);
            this.addCtrlToListNew(newCtrl,panel);
            this.refreshAllCtrlState(true);  
            if(this.mSelectCtrlPointNew != null){
                this.mSelectCtrlPointNew.setSelected(false);
                this.mSelectCtrlPointNew = null;
            }
            this.mSelectCtrlPointNew = newCtrl;  
            this.mSelectCtrlPointNew.setSelected(true);
            // this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
            return newCtrl;
        }


        //����������µĵ�;
        public addNewCtrlFromLine(dstCtrl:ControlPointView, x:number, y:number){
            let newCtrl = new ControlPointView(x, y);
            this.addChild(newCtrl);
            let lastCtrl = dstCtrl.getLastCtrl();
            newCtrl.setLastControl(lastCtrl);
            lastCtrl.setNextControl(newCtrl);
            newCtrl.setNextControl(dstCtrl);
            dstCtrl.setLastControl(newCtrl);
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
            }
            this.mSelectCtrlPoint = newCtrl;
            this.mSelectCtrlPoint.setSelected(true);
            this.refreshAllCtrlState(); 
            this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
        }

        protected refreshAllCtrlState(type?,bool?){
            let listTemp = bool?this.mHeadCtrlViewNew:this.mHeadCtrlView;
            while(listTemp != null){
                listTemp.refreshState();
                if(type){
                    listTemp.refreshConnectLines(type);
                }
                else{
                    listTemp.refreshConnectLines();
                }
                listTemp = listTemp.getNextCtrl();
            }
        }

        protected onTouchMove(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchMove(event);
            }
        }

        protected onTouchCancel(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null)this.mSelectCtrlPoint.onTouchCancel(event);
        }

        protected onTouchReleaseOutside(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null)this.mSelectCtrlPoint.onTouchReleaseOutside(event);
        }

        //��������;
        protected onTouchEnd(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchEnd(event);
                this.operCmdList.push(new OperTouchControlCmd("moveCtrl", this.mSelectCtrlPoint, this.mTouchBeginPos));
            }
        }

        public getHoverControlPoint(x, y):ControlPointView{
            let listTemp = this.mHeadCtrlViewNew;//this.mHeadCtrlView;
            while(listTemp != null){
                if(listTemp.isHover(x, y) == true){
                    return listTemp;
                }
                listTemp = listTemp.getNextCtrl();
            }
            return null;
        }


        //��ȡ
        public getHoverCtontrolLine(x, y, ignoreDistance:number = 5):{CtrlPt:ControlPointView, x:number, y:number}{
            let listTemp = this.mHeadCtrlView;
            while(listTemp != null){
                let hoverLineInfo = listTemp.getHoverLine(x, y, ignoreDistance);
                
                if(hoverLineInfo.hover == true){
                    return {CtrlPt:listTemp, x:hoverLineInfo.x, y:hoverLineInfo.y};
                }
                listTemp = listTemp.getNextCtrl();
            }
            return{CtrlPt:null, x:0,y:0};
        }

        //��ӿ��Ƶ㵽·����;
        protected addCtrlToList(ctrl:ControlPointView){
            if(this.mHeadCtrlView == null){
                this.mHeadCtrlView = ctrl;
                this.mHeadCtrlViewNew = ctrl;
                this.mTailCtrlView = ctrl;
                this.addChild(this.mHeadCtrlView);
            }else{
                if(this.mTailCtrlView == null){
                    this.mTailCtrlView = this.mTailCtrlViewNew
                }
                this.mTailCtrlView.setNextControl(ctrl);
                ctrl.setLastControl(this.mTailCtrlView);
                this.mTailCtrlView = ctrl;
                this.mTailCtrlViewNew = ctrl;
            }  
        }

        //��ӵ��ӿ��Ƶ㵽·����;
        protected addCtrlToListNew(ctrl:ControlPointView,panel){
            if(this.mHeadCtrlView == null){
                this.mHeadCtrlView = ctrl;
                this.mTailCtrlView = ctrl;
                panel.addChild(this.mHeadCtrlView);
            }else{
                this.mTailCtrlView.setNextControl(ctrl);
                ctrl.setLastControl(this.mTailCtrlView);
                this.mTailCtrlView = ctrl;
            }  
        }

        //���·��;
        public clear(){
            let listTemp
            if(this.mHeadCtrlViewNew){
                listTemp = this.mHeadCtrlViewNew;
            }
            else{
                listTemp = this.mHeadCtrlView;
            }
            while(listTemp != null){
                this.removeChild(listTemp);
                // listTemp.visible = false;
                listTemp = listTemp.getNextCtrl();
            }
            this.mHeadCtrlView = null;
            this.mHeadCtrlViewNew = null;
            this.mTailCtrlView = null;
            this.mSelectCtrlPoint = null;
        }

        public get HeadCtrlView(){
            return this.mHeadCtrlView;
        }
        public set HeadCtrlView(headCtrl:ControlPointView){
            this.mHeadCtrlView = headCtrl;
        }

        public get TailCtrlView(){
            return this.mHeadCtrlView;
        }
        public set TailCtrlView(tailCtrl:ControlPointView){
            this.mTailCtrlView = tailCtrl;
        }

        //��ȡ·��������;
        public getPathDatas():Array<{x,y}>{
            let result:Array<{x,y}> =new Array<{x,y}>();
            let listTemp = this.mHeadCtrlView;
            while(listTemp != null){
                result.push({x:listTemp.x-this.anchorOffsetX, y:listTemp.y-this.anchorOffsetY});
                listTemp = listTemp.getNextCtrl();
            }
            return result;
        }

        public setPathDatas(data:Array<{x, y}>){
            this.clear();
            for(let i:number=0; i<data.length; i++){
                this.addNewControlPoint(data[i].x+this.anchorOffsetX, data[i].y+this.anchorOffsetY);
            }
            this.operCmdList = [];
        }

        public setPathDatasNew(data:Array<{x, y}>,panel){
            this.mHeadCtrlView = null;
            this.mTailCtrlView = null;
            let groupNew = new eui.Group()
            groupNew.width = 1280;
            groupNew.height = 720;
            groupNew.touchEnabled = false;
            // groupNew.scaleX = 0.8;
            // groupNew.scaleY = 0.78;
            panel.ImmovableGridGroup.addChild(groupNew)
            for(let i:number=0; i<data.length+1; i++){
                if(i == data.length){
                    this.mTailCtrlView = null;
                }
                else{
                    this.addNewControlPointNew(data[i].x+groupNew.anchorOffsetX, data[i].y+groupNew.anchorOffsetY,groupNew);
                }
            }
        }

        //��������;
        public cancelOperate(){
            if(this.operCmdList.length==0){
                return false;
            }
            let cmd = this.operCmdList.pop();
            cmd.cancel();
            this.refreshAllCtrlState(null,true);
            return true;
        }

        //ɾ��ѡ�е�;
        public deleteSelectPoint(ctrl:ControlPointView = null){
            if(ctrl != null){
                if(this.mSelectCtrlPoint != null){
                    this.mSelectCtrlPoint.setSelected(false);
                }
                this.mSelectCtrlPoint = ctrl;
            }
            if(this.mSelectCtrlPoint != null){
                let lastCtrl = this.mSelectCtrlPoint.getLastCtrl();
                let nextCtrl = this.mSelectCtrlPoint.getNextCtrl();
                if(lastCtrl != null){
                    lastCtrl.setNextControl(nextCtrl);
                }
                if(nextCtrl != null){
                    nextCtrl.setLastControl(lastCtrl);
                }
                if(this.mHeadCtrlView == this.mSelectCtrlPoint){
                    this.mHeadCtrlView = nextCtrl;
                }
                if(this.mTailCtrlView == this.mSelectCtrlPoint){
                    this.mTailCtrlView = lastCtrl;
                }
                this.refreshAllCtrlState();
                if(lastCtrl != null){
                    lastCtrl.refreshConnectLines();
                }
                if(nextCtrl != null){
                    nextCtrl.refreshConnectLines();
                }
                this.removeChild(this.mSelectCtrlPoint);
                this.mSelectCtrlPoint = null;
            }
        }

    }

}