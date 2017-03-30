game.import("extension",{name:"无名扩展",content:function (config,pack){
    
},precontent:function (){
    
},help:{},config:{},package:{
    character:{
        character:{
            test1:["male","wei",4,["去除技能"],[]],
            test2:["male","shu",4,["保留技能","去除技能","test1","qi_xiongsuan"],[]],
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
                    console.log(target);
                    target.clearSkills = function (all) {
                        target.popup('无效');
                    };
                    console.log(player);
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
					console.log(_skill)
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
					player:'phaseEnd',
				},
				forced:true,
				content:function(){
					_target=player.storage.recove_target;
					_skill=player.storage.recove_target_skill;
					_target.storage[_skill]=false;
					_target.markSkill(_skill);
					_target.enableSkill(_skill+'_awake');
					_target.syncStorage(_skill);
					_target.awakenedSkills.remove(_skill);
	
				},
			},

            huashen:{
			unique:true,
			forbid:['guozhan'],
			init:function(player){
				player.storage.huashen={
					list:[],
					owned:{},
					player:player,
				}
			},
			get:function(player,num){
				if(typeof num!='number') num=1;
				while(num--){
					var name=player.storage.huashen.list.randomRemove();
					var skills=lib.character[name][3].slice(0);
					for(var i=0;i<skills.length;i++){
						var info=lib.skill[skills[i]];
						if(info.unique&&!info.gainable){
							skills.splice(i--,1);
						}
					}
					player.storage.huashen.owned[name]=skills;
					player.popup(name);
					game.log(player,'获得了一个化身');
				}
			},
			group:['huashen1','huashen2'],
			intro:{
				content:function(storage,player){
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
					var skill=player.additionalSkills.huashen[0];
					if(skill){
						str+='<p>当前技能：'+get.translation(skill);
					}
					return str;
				},
				mark:function(dialog,content,player){
					var slist=content.owned;
					var list=[];
					for(var i in slist){
						list.push(i);
					}
					if(list.length){
						dialog.addSmall([list,'character']);
					}
					var skill=player.additionalSkills.huashen[0];
					if(skill){
						dialog.add('<div><div class="skill">【'+get.translation(skill)+
						'】</div><div>'+lib.translate[skill+'_info']+'</div></div>');
					}
				}
			},
			mark:true
		},
		huashen1:{
			trigger:{player:['phaseBefore']},
			forced:true,
			popup:false,
			priority:10,
			filter:function(event,player){
			    return true;
				//return player.storage.huashen.list.length<2;
			},
			content:function(){
			    'step 0'
			    var names=[],num=5,selected=0,describ='';
			    while(num--){
					var name=player.storage.huashen.list.randomRemove();
					names.push(name);
				}

				if(player.storage.huashen.list&&player.storage.huashen.list.length<2){
			        selected=2;
			        describ='请选择两名武将'
                } else{
				    selected=1;
				    describ='请选择一名武将'
                }

			    dialog=ui.create.dialog(describ,[names,'character']);
                game.me.chooseButton(dialog,true).selectButton=function(){
					return [selected,selected];
				};

                'step 1'
                var owners = result.links.length;
                if(owners==1){
                    var myowners=[];
                    for(var i in player.storage.huashen.owned){
                        myowners.push(i);
                    }
                    dialog=ui.create.dialog('请选择一名待替换的角色',[myowners,'character']);
                    game.me.chooseButton(dialog,true).selectButton=function(){
                        return [selected,selected];
                    };

                }
                else{
                   for(var i=0;i<pwners;i++){
                        var name=result.links[i].name;
                        var skills=lib.character[name][3].slice(0);
                        for(var j=0;j<skills.length;j++){
                            var info=lib.skill[skills[j]];
                            if(info.unique&&!info.gainable){
                                skills.splice(j--,1);
                            }
                        }
                        player.storage.huashen.owned[name]=skills;
                        player.popup(name);
                        game.log(player,'获得了一个化身');
                    }
                }



                var double=(result.links.length==2);
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
						player.storage.huashen.list.push(i);
					}
				}
				for(var i=0;i<game.players.length;i++){
					player.storage.huashen.list.remove([game.players[i].name]);
					player.storage.huashen.list.remove([game.players[i].name1]);
					player.storage.huashen.list.remove([game.players[i].name2]);
				}

				lib.skill.huashen.get(player,2);
			}
		},
		huashen2:{
			audio:2,
			trigger:{player:['phaseBegin','phaseEnd'],global:'gameStart'},
			filter:function(event,player,name){
				if(name=='phaseBegin'&&game.phaseNumber==1) return false;
				return true;
			},
			priority:-9,
			forced:true,
			popup:false,
			content:function(){
				var slist=player.storage.huashen.owned;
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
							var mark=player.marks.huashen;
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
							}
							player.addAdditionalSkill('huashen',link);
							player.logSkill('huashen2');
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
			}
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
            huashen:'化身',
            huashen1:'化身1',
            huashen2:'化身2',
            huashen_info:'新化身',
        },
    },
},files:{"character":["test2.jpg","test1.jpg"],"card":[],"skill":[]}})