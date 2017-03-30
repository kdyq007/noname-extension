game.import("extension",{name:"无名扩展",content:function (config,pack){
    
},precontent:function (){
    
},help:{},config:{},package:{
    character:{
        character:{
            test1:["male","wei",4,["去除技能","huashen"],[]],
            test2:["male","shu",4,["保留技能","去除技能","test1","qi_xiongsuan","qi_huashen","qi_xinsheng"],[]],
        },
        translate:{
            test1:"test1",
            test2:"test2",
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
            去除技能:{
                enable:"phaseUse",
                filterTarget:function (player,target){
    return player!=target&&target.isAlive},
                content:function (){
    target.clearSkills();
    },
            },
            保留技能:{
                enable:"phaseUse",
                priority:0,
                unique:true,
                selectTarget:1,
                filterTarget:function (player,target){
                return target.isAlive},
                content:function (){
                    target.clearSkills = function (all) {
                        target.popup('无效');
                    };
                    player.loseMaxHp();
                },
            },
            qi_xiongsuan:{
                enable:"phaseUse",
                unique:true,
                mark:true,
                init:function (player){
                    player.storage.qi_xiongsuan=false;
                },
                filterCard:true,
                filterTarget:function (card,player,target){
                    //return target.group==player.group&&target!=player;
                    return target.group==player.group;
                },
                prompt:"弃置一张手牌并选择一名与你势力相同的角色",
                content:function (){
                    'step 0'
                    target.damage();
                    player.draw(3);
                    player.storage.qi_xiongsuan=true;
                    player.awakenSkill('qi_xiongsuan');

                    var unique_skills = [];
                    for (var i=0;i<target.skills.length;i++){
                        var _skill = get.info(target.skills[i]);
                        if(_skill.unique && _skill.unique==true) unique_skills.push(target.skills[i]);
                    }
                    player.chooseControl(unique_skills).set('prompt','选择要重置的技能');;
                    'step 1'
                    var _skill = result.control;
                    if(_skill){
                        player.storage.recove_target=target;
                        player.storage.recove_target_skill=_skill;
                        player.addTempSkill('qi_xiongsuan1',{player:'phaseAfter'});
                    }
                },
                intro:{
                    content:"limited",
                },
            },
            qi_xiongsuan1:{
                trigger:{
                    player:"phaseEnd",
                },
                forced:true,
                content:function (){
                    _target=player.storage.recove_target;
                    _skill=player.storage.recove_target_skill;
                    _target.storage[_skill]=false;
                    _target.markSkill(_skill);
                    _target.enableSkill(_skill+'_awake');
                    _target.syncStorage(_skill);
                    _target.awakenedSkills.remove(_skill);
    
                },
            },
            qi_huashen:{
                unique:true,
                init:function (player){
                player.storage.qi_huashen={
                    list:[],
                    selects:[],
                    owned:{},
                    player:player,
                }
            },
                get:function (player,num,add){
                    player.storage.qi_huashen.selects = [];
                    if(typeof num!='number') num=1;
                    if(typeof add!='bool') add=false;
                while(num--){
                    var name=player.storage.qi_huashen.list.randomRemove();
					if(add){
						console.log(add);
						var skills=lib.character[name][3].slice(0);
						for(var i=0;i<skills.length;i++){
							var info=lib.skill[skills[i]];
							if(info.unique&&!info.gainable){
								skills.splice(i--,1);
							}
						}
						player.storage.qi_huashen.owned[name]=skills;
						player.popup(name);
						game.log(player,'获得了一个化身');
					}
					else{
						player.storage.qi_huashen.selects.push(name);
					}
                }
            },
                group:["qi_huashen1","qi_huashen2"],
                intro:{
                    content:function (storage,player){
                    var str='';
                    var slist=storage.owned;
                    var list=[];
                    for(var i in slist){
                        list.push(i);
                    }
                    if(list.length){
                        str+=get.translation(list[0]);
                        for(var i=1;i<list.length;i++){
                            str+='、'+get.translation(list[i]);
                        }
                    }
                    var skill=player.additionalSkills.qi_huashen[0];
                    if(skill){
                        str+='<p>当前技能：'+get.translation(skill);
                    }
                    return str;
                },
                    mark:function (dialog,content,player){
                    var slist=content.owned;
                    var list=[];
                    for(var i in slist){
                        list.push(i);
                    }
                    if(list.length){
                        dialog.addSmall([list,'character']);
                    }
                    var skill=player.additionalSkills.qi_huashen[0];
                    if(skill){
                        dialog.add('<div><div class="skill">【'+get.translation(skill)+
                        '】</div><div>'+lib.translate[skill+'_info']+'</div></div>');
                    }
                },
                },
                mark:true,
            },
            qi_huashen1:{
                audio:"ext:无名扩展:2",
                trigger:{
                    player:["phaseBegin","phaseEnd"],
                    global:"gameStart",
                },
                filter:function (event,player,name){
                if(name=='phaseBegin'&&game.phaseNumber==1) return false;
                return true;
            },
                priority:-9,
                forced:true,
                popup:false,
                content:function (){
                    'step 0'
                    if (!player.storage.qi_huashen.list || player.storage.qi_huashen.list.length==0){
                        for(var i in lib.character){
                            if(i.indexOf('stone_')==0) continue;
                            var add=false;
                            for(var j=0;j<lib.character[i][3].length;j++){
                                var info=lib.skill[lib.character[i][3][j]];
                                if(!info){
                                    continue;
                                }
                                if(info.gainable||!info.unique){
                                    add=true;break;
                                }
                            }
                            if(add){
                                player.storage.qi_huashen.list.push(i);
                            }
                        }
                        for(var i=0;i<game.players.length;i++){
                            player.storage.qi_huashen.list.remove([game.players[i].name]);
                            player.storage.qi_huashen.list.remove([game.players[i].name1]);
                            player.storage.qi_huashen.list.remove([game.players[i].name2]);
                        }
                    }
                    lib.skill.qi_huashen.get(player,5);
                    var owned=0,selected=0,describ="";
                    for(var i in player.storage.qi_huashen.owned){
                        owned++;
                    }
                        if(owned<2){
                            selected=2;
                            describ='请选择两名武将'
                        } else{
                            selected=1;
                            describ='请选择一名武将替换已有'
                        }
                    player.chooseButton(ui.create.dialog(describ,[player.storage.qi_huashen.selects,'character']),false).selectButton=function(){
                            return [selected,selected];
                        };

                        'step 1'
                    if(result.bool){
                        var slist=player.storage.qi_huashen.owned;
                        var names=[];
                            for(var i in slist){
                                names.push(i);
                        }
                        var list = result.links;
                        for(var i=0;i<list.length;i++){
                            var name=list[i];
                            player.storage.qi_huashen.list.remove(name);
                            var skills=lib.character[name][3].slice(0);
                            for(var j=0;j<skills.length;j++){
                                var info=lib.skill[skills[j]];
                                if(info.unique&&!info.gainable){
                                    skills.splice(j--,1);
                                }
                            }
                            player.storage.qi_huashen.owned[name]=skills;
                            player.popup(name);
                            game.log(player,'获得了一个化身');
                            player.storage.qi_huashen.selects.remove(name);
                        }
                        var recycles = player.storage.qi_huashen.selects;
                        for(var i=0;i<recycles.length;i++){
                            player.storage.qi_huashen.list.push(recycles[i]);
                        }
                        player.storage.qi_huashen.selects=[];
                        if (list.length == 1){
                            ui.clear();
                            player.chooseButton(ui.create.dialog('请选择一个需被替换的武将',[names,'character']),false).selectButton=function(result){
                                return [1,1]
                            };
                         }
                         else{
                            event.goto(3);
                        }
                    }
                    else{
                        event.finish();
                    }
                    'step 2'
                    if(result.bool){
                        delete player.storage.qi_huashen.owned[result.links[0]];
                    }

                    'step 3'
                    var slist=player.storage.qi_huashen.owned;
                    var list=[];
                        for(var i in slist){
                            list.push(i);
                    }
                    if(event.isMine()){
                    event.dialog=ui.create.dialog('选择获得一项技能',[list,'character']);
                    if(trigger.name=='game'){
                        event.control=ui.create.control();
                    }
                    else{
                        event.control=ui.create.control(['cancel2']);
                    }
                    event.clickControl=function(link){
                        if(link!='cancel2'){
                            var currentname=event.dialog.querySelector('.selected.button').link;
                            console.log(currentname);
                            var mark=player.marks.qi_huashen;
                            if(trigger.name=='game'){
                                mark.hide();
                                // mark.style.transform='scale(0.8)';
                                mark.style.transition='all 0.3s';
                                setTimeout(function(){
                                    mark.style.transition='all 0s';
                                    ui.refresh(mark);
                                    mark.setBackground(currentname,'character');
                                    if(mark.firstChild){
                                        mark.firstChild.remove();
                                    }
                                    setTimeout(function(){
                                        mark.style.transition='';
                                        mark.show();
                                        // mark.style.transform='';
                                    },50);
                                },500);
                            }
                            else{
                                if(mark.firstChild){
                                    mark.firstChild.remove();
                                }
                                mark.setBackground(currentname,'character');
                                mark.show();
                            }
                            player.addAdditionalSkill('qi_huashen',link);
                            player.logSkill('qi_huashen2');
                            game.log(player,'获得技能','【'+get.translation(link)+'】');
                            player.popup(link);

                            for(var i=0;i<event.dialog.buttons.length;i++){
                                if(event.dialog.buttons[i].classList.contains('selected')){
                                    var name=event.dialog.buttons[i].link;
                                    player.sex=lib.character[name][0];
                                    player.group=lib.character[name][1];
                                    // player.node.identity.style.backgroundColor=get.translation(player.group+'Color');
                                    break;
                                }
                            }

                            if(event.triggername=='phaseBegin'){
                                (function(){
                                    var skills=[link];
                                    var list=[];
                                    game.expandSkills(skills);
                                    var triggerevent=event._trigger;
                                    var name='phaseBegin';
                                    for(i=0;i<skills.length;i++){
                                        var trigger=get.info(skills[i]).trigger;
                                        if(trigger){
                                            var add=false;
                                            if(player==triggerevent.player&&trigger.player){
                                                if(typeof trigger.player=='string'){
                                                    if(trigger.player==name) add=true;
                                                }
                                                else if(trigger.player.contains(name)) add=true;
                                            }
                                            if(trigger.global){
                                                if(typeof trigger.global=='string'){
                                                    if(trigger.global==name) add=true;
                                                }
                                                else if(trigger.global.contains(name)) add=true;
                                            }
                                            if(add&&player.isOut()==false) list.push(skills[i]);
                                        }
                                    }
                                    for(var i=0;i<list.length;i++){
                                        game.createTrigger('phaseBegin',list[i],player,triggerevent);
                                    }
                                }());
                            }
                        }
                        ui.auto.show();
                        event.dialog.close();
                        event.control.close();
                        game.resume();
                    };
                    event.control.custom=event.clickControl;
                    ui.auto.hide();
                    game.pause();
                    for(var i=0;i<event.dialog.buttons.length;i++){
                        event.dialog.buttons[i].classList.add('selectable');
                    }
                    event.custom.replace.button=function(button){
                        if(button.classList.contains('selected')){
                            button.classList.remove('selected');
                            if(trigger.name=='game'){
                                event.control.style.opacity=0;
                            }
                            else{
                                event.control.replace(['cancel2']);
                            }
                        }
                        else{
                            for(var i=0;i<event.dialog.buttons.length;i++){
                                event.dialog.buttons[i].classList.remove('selected');
                            }
                            button.classList.add('selected');
                            event.control.replace(slist[button.link]);
                            if(trigger.name=='game'&&getComputedStyle(event.control).opacity==0){
                                event.control.style.transition='opacity 0.5s';
                                ui.refresh(event.control);
                                event.control.style.opacity=1;
                                event.control.style.transition='';
                                ui.refresh(event.control);
                            }
                            else{
                                event.control.style.opacity=1;
                            }
                        }
                        event.control.custom=event.clickControl;
                    }
                    event.custom.replace.window=function(){
                        for(var i=0;i<event.dialog.buttons.length;i++){
                            if(event.dialog.buttons[i].classList.contains('selected')){
                                event.dialog.buttons[i].classList.remove('selected');
                                if(trigger.name=='game'){
                                    event.control.style.opacity=0;
                                }
                                else{
                                    event.control.replace(['cancel2']);
                                }
                                event.control.custom=event.clickControl;
                                return;
                            }
                        }
                    }
                }
                else{
                    event.finish();
                }

            },
            },
            qi_huashen2:{
                trigger:{
                    player:"useSkillAfter",
                },
                forced:true,
                content:function (){
                    console.log('OKOKOK');
                    player.removeAdditionalSkill('qi_huashen', trigger);
                    var charas = player.storage.qi_huashen.owned;
                    for(var i in charas){
                        if(charas[i].indexOf(trigger.skill)!=-1) {
                            delete player.storage.qi_huashen.owned[i];
                            player.storage.qi_huashen.list.push(i);
                        }
                    }
                    player.marks.qi_huashen.hide();
                },
            },
            qi_xinsheng:{
                audio:"ext:无名扩展:2",
                unique:true,
                trigger:{
                    player:"damageEnd",
                },
                frequent:true,
                filter:function (event,player){
                return player.storage.qi_huashen&&player.storage.qi_huashen.list&&
                    player.storage.qi_huashen.list.length>0;
            },
                content:function (){
					console.log('xinshen')
                lib.skill.qi_huashen.get(player,1,true);
            },
            },
        },
        translate:{
            去除技能:"去除技能",
            去除技能_info:"去除技能",
            保留技能:"保留技能",
            保留技能_info:"保留技能",
            qi_xiongsuan:"凶算",
            qi_xiongsuan1:"凶算1",
            qi_xiongsuan_info:"凶算",
            qi_xiongsuan1_info:"凶算1",
            qi_huashen:"化身",
            qi_huashen1:"化身1",
            qi_huashen2:"化身2",
            qi_huashen_info:"新化身",
            qi_xinsheng:"新身",
            qi_xinsheng_info:"新新身",
        },
    },
},files:{"character":["test2.jpg","test1.jpg"],"card":[],"skill":[]}})