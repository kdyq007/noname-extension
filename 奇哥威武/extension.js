game.import("extension",{name:"奇哥威武",content:function (config,pack){
    
},precontent:function (){
    
},help:{},config:{},package:{
    character:{
        character:{
            雷神·奇哥:["male","qun",4,["天雷","嘲讽","奇才","公道"],["zhu","boss","bossallowed"]],
            万磁王·奇哥:["male","qun",4,["控磁","磁暴","磁场","主宰"],["zhu","boss","bossallowed"]],
        },
        translate:{
            雷神·奇哥:"雷神·奇哥",
            万磁王·奇哥:"万磁王·奇哥",
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{
            天雷:{
                audio:"ext:奇哥威武:2",
                trigger:{
                    player:"respond",
                },
                filter:function (event,player){
        return event.card.name=='shan';
    },
                direct:true,
                content:function (){
        "step 0";
        player.chooseTarget(get.prompt('releiji')).ai=function(target){
            return ai.get.damageEffect(target,_status.event.player,_status.event.player,'thunder');
        };
        "step 1"
        if(result.bool){
            player.logSkill('releiji',result.targets,'thunder');
            event.target=result.targets[0];
            event.target.judge(function(card){
                var suit=get.suit(card);
                if(suit=='spade') return -4;
                if(suit=='club' || suit=='diamond') return -2;
                return 0;
            });
        }
        else{
            event.finish();
        }
        "step 2"
        if(result.suit=='spade'){
            event.target.damage(2,'thunder');
        }
        else if(result.suit=='heart'){
            if(target.hasSkill('hongyan')){
                event.target.damage(2,'thunder');
            }
            else{
                player.recover(2, 'nosource');
            }
        }
        else{
            event.target.damage('thunder');
            player.recover();
        }
    },
                ai:{
                    effect:{
                        target:function (card,player,target,current){
                if(get.tag(card,'respondShan')){
                    var hastarget=game.hasPlayer(function(current){
                        return ai.get.attitude(target,current)<0;
                    });
                    var be=target.num('e',{color:'black'});
                    if(target.num('h','shan')&&be){
                        if(!target.hasSkill('guidao')) return 0;
                        return [0,hastarget?target.num('he')/2:0];
                    }
                    if(target.num('h','shan')&&target.num('h')>2){
                        if(!target.hasSkill('guidao')) return 0;
                        return [0,hastarget?target.num('h')/4:0];
                    }
                    if(target.num('h')>3||(be&&target.num('h')>=2)){
                        return [0,0];
                    }
                    if(target.num('h')==0){
                        return [1.5,0];
                    }
                    if(target.num('h')==1&&!be){
                        return [1.2,0];
                    }
                    if(!target.hasSkill('guidao')) return [1,0.05];
                    return [1,Math.min(0.5,(target.num('h')+be)/4)];
                }
            },
                    },
                },
            },
            嘲讽:{
                audio:"4",
                enable:"phaseUse",
                usable:1,
                filterTarget:function (card,player,target){
        return target.num('he');
    },
                content:function (){
        "step 0"
        target.chooseToUse({name:'sha'}, player, true, '嘲讽：必须对'+get.translation(player)+'使用一张杀，或令其弃置你的一张牌').set('targetRequired',true);
        "step 1"
        if(result.bool==false&&target.num('he')>0){
            player.discardPlayerCard(target,'he',true);
        }
        else{
            event.finish();
        }
    },
                ai:{
                    order:4,
                    expose:0.2,
                    result:{
                        target:-1,
                        player:function (player,target){
                if(target.num('h')==0) return 0;
                if(target.num('h')==1) return -0.1;
                if(player.hp<=2) return -2;
                if(player.num('h','shan')==0) return -1;
                return -0.5;
            },
                    },
                    threaten:1.1,
                },
            },
            奇才:{
                audio:"ext:奇哥威武:2",
                trigger:{
                    global:"judge",
                },
                filter:function (event,player){
        return player.num('he')>0;
    },
                direct:true,
                content:function (){
        "step 0"
        player.chooseCard(get.translation(trigger.player)+'的'+(trigger.judgestr||'')+'判定为'+
        get.translation(trigger.player.judging[0])+'，是否发动【奇才】？','he').set('ai',function(card){
            var trigger=_status.event.getTrigger();
            var player=_status.event.player;
            var judging=_status.event.judging;
            var result=trigger.judge(card)-trigger.judge(judging);
            var attitude=ai.get.attitude(player,trigger.player);
            if(attitude==0||result==0) return 0;
            if(attitude>0){
                return result;
            }
            else{
                return -result;
            }
        }).set('judging',trigger.player.judging[0]);
        "step 1"
        if(result.bool){
            player.respond(result.cards,'highlight');
        }
        else{
            event.finish();
        }
        "step 2"
        if(result.bool){
            player.logSkill('guidao');
            player.$gain2(trigger.player.judging[0]);
            player.gain(trigger.player.judging[0]);
            trigger.player.judging[0]=result.cards[0];
            if(!get.owner(result.cards[0],'judge')){
                trigger.position.appendChild(result.cards[0]);
            }
            game.log(trigger.player,'的判定牌改为',result.cards[0]);
        }
        "step 3"
        game.delay(2);
    },
                ai:{
                    tag:{
                        rejudge:1,
                    },
                },
            },
            公道:{
                audio:"ext:奇哥威武:2",
                trigger:{
                    player:"damageEnd",
                },
                direct:true,
                filter:function (event,player){
        return (event.source&&event.num>0&&event.source!=player);
    },
                content:function (){
        for(i=0;i<trigger.num;i++){
            player.gain(game.createCard({name:'shan'}),'draw');
        }
    },
                ai:{
                    effect:{
                        target:function (card,player,target){
                if(player.num('he')>1&&get.tag(card,'damage')){
                    if(player.hasSkill('jueqing')) return [1,-1.5];
                    if(ai.get.attitude(target,player)<0) return [1,1];
                }
            },
                    },
                },
            },
            控磁:{
                audioname:["tiesuo"],
                trigger:{
                    player:["phaseBegin","phaseEnd"],
                },
                content:function (){
        "step 0"
        var check;
        check=(game.players.length>=2);
        player.chooseTarget('是否发动【控磁】？',[1,game.players.length],true,function(target){
            if(!_status.event.aicheck) return 0;
            var att=ai.get.attitude(_status.event.player,target);
            return 1-att;
        }).set('aicheck',check);
        
        "step 1"
        if(result.bool){
            player.logSkill('kongci',result.targets);
            for(var i=0;i<result.targets.length;i++){
                result.targets[i].link();
            }
            //trigger.finish();
            //trigger.untrigger();
        }
        "step 2"
        if(result.bool) game.delay();
    },
                ai:{
                    threaten:2,
                    expose:0.3,
                },
            },
            磁暴:{
                audio:"ext:奇哥威武:true",
                trigger:{
                    player:"useCardToBefore",
                },
                priority:8,
                filter:function (event,player){
        if(event.card.name=='sha'&&player.storage.em) return true;
    },
                check:function (event,player){
        var att=ai.get.attitude(player,event.target);
        if(event.target.hasSkillTag('nofire')){
            return att>0;
        }
        return att<=0;
    },
                content:function (){
        trigger.card.nature='thunder';
        player.storage.em--;
    },
            },
            主宰:{
                trigger:{
                    player:"damageEnd",
                },
                forced:true,
                filter:function (event,player){
        return (event.source&&event.source!=player);
    },
                content:function (){
        if(!player.isLinked()) player.link();
        if(!trigger.source.isLinked()) trigger.source.link();
        if(trigger.nature=='thunder' && trigger.num>1) trigger.num++;
    },
            },
            磁场:{
                audio:"ext:奇哥威武:2",
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                filter:function (event,player){
        return true;
    },
                init:function (player){
        player.storage.em=0;
    },
                content:function (){
        if(trigger.nature!='fire'){
           player.storage.em+=trigger.num;
           if(trigger.nature=='thunder' && trigger.num>1) trigger.num--;
    }
},
            },
        },
        translate:{
            天雷:"天雷",
            天雷_info:"每当你使用或打出一张【闪】，可令任意一名角色进行一次判定，若结果为黑桃，其受到两点雷电伤害；若结果为红桃，你回复两点体力；若为梅花或方片，其受到一点雷电伤害，然后你回复一点体力。",
            嘲讽:"嘲讽",
            嘲讽_info:"出牌阶段，你可以指定一名使用【杀】能攻击到你的角色，该角色必须对你使用一张【杀】，若该角色没有【杀】，你弃掉他的一张牌，每回合限一次。",
            奇才:"奇才",
            奇才_info:"任意一名角色的判定生效前，你可以打出一张牌替换之。",
            公道:"公道",
            公道_info:"每当你受到伤害后，你可以获得与伤害值数量相同的闪。",
            控磁:"控磁",
            控磁_info:"开场和结束时各能发起一次无数量限制的铁索连环。",
            磁暴:"磁暴",
            磁暴_info:"你可以将磁场存储的电磁随杀打出，此杀视为雷杀。",
            主宰:"主宰",
            主宰_info:"每当受到敌方伤害，自动将自己和敌方锁链。",
            磁场:"磁场",
            磁场_info:"每当你受到非火属性的伤害，你都能将此伤害转储为一份电磁；并且你所受大于1点的雷电伤害减少1点。",
        },
    },
},files:{"character":["万磁王·奇哥.jpg","雷神·奇哥.jpg"],"card":[],"skill":[]}})