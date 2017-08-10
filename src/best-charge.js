'use strict';

const promotion = require('./promotions.js');
const loadItem = require('./items.js');

// #2 转换输入的格式
function transSelectedItem(selectionItems){
  let new_arr =[];
  for(let item of selectionItems){
    let id = item.split('x')[0].replace(' ','');
    let count = parseInt(item.split('x')[1],10);
    let trans_item = {id,count};
    new_arr.push(trans_item);
  }
  return new_arr;
}

function find(collection,item){
  for(let each_item of collection){
    if(each_item['id']==item['id']){
      return each_item
    }
  }
  return false

}

// #3 补充item所有的相关详细信息
function getDetailItems(items){
  let new_arr=[];
  let all_items = loadItem.loadAllItems();
  for(let item of items){
    let finded = find(all_items,item);
    if (finded){
      finded.count = item.count
      new_arr.push(finded)
    }
  }
  return new_arr;
}

function findHalfPro(collection){
  for (let item of collection){
    if (item.items){
      return item['items']
    }
  }
  return false;
}

function findHalf(half_items,each_item){
  for(let half_item of half_items){
    if(half_item == each_item['id']){
      return each_item
    }
  }
  return false;
}

// #4 用指定菜品半价算
function halfPrice(allitems){
  let sum=0;
  let half_arr=[];
  let promotion_info = promotion.loadPromotions();
  let half_items = findHalfPro(promotion_info) //获取指定菜品id
  for(let each_item of allitems){
    let to_half_price = findHalf(half_items,each_item)
    if (to_half_price){
      half_arr.push(to_half_price);
      sum+=to_half_price['count']*to_half_price['price']*0.5
    }else{
      sum+=parseInt(each_item['count']*each_item['price'],10)
    }

  }
  let result = {sum,half_arr};
  return result;
}

// #5 用满减算
function debatePrice(allitems){
  let sum = 0;
  let result=[];
  for(let each_item of allitems){
    sum+=each_item['count']*each_item['price']
  }
  if(sum>30){
    sum =sum-6;
    result =[sum,true]
  }else{
    result=[sum,false];
  }
  return result;

}

function useHalf(half_price_result){
  let reduce=0;
  let result='';
  result+='指定菜品半价('
  for(let each_half of half_price_result['half_arr']){
    result+=each_half['name']+'，'
    reduce+=each_half['price']*each_half['count']*0.5
  }
  result=result.substr(0,result.length-1);
  result+=')，省'+ reduce+'元\n';
  result+='-----------------------------------\n'
  result+='总计：'+half_price_result['sum']+'元\n'
  result+='==================================='

  return result;

}

function useRebate(rebate_price_result){
  let result=''
  result+='满30减6元，省6元\n'
  result+='-----------------------------------\n'
  result+='总计：'+rebate_price_result[0]+'元\n'
  result+='==================================='
  return result;

}

// 打印最终结果
function printResult(allitems_detail,half_price_result,rebate_price_result){
  let result ='\n============= 订餐明细 =============\n';
  for(let each_item of allitems_detail){
    result+=each_item['name']+' x '+each_item['count']+' = '+each_item['price']*each_item['count']+'元\n'
  }
  result+='-----------------------------------\n'
  if (half_price_result['half_arr'].length!=0){
    result+='使用优惠:\n'
    if (half_price_result['sum']<rebate_price_result[0]){
      result += useHalf(half_price_result);
    }else if(half_price_result['sum']>rebate_price_result[0]){
      result +=useRebate(rebate_price_result);
    }else if(half_price_result['sum']==rebate_price_result[0]){
      result += useHalf(half_price_result);
    }

  }else if((half_price_result['half_arr'].length==0)&&(rebate_price_result[1]==false)){
    result+='总计：'+rebate_price_result[0]+'元\n'
    result+='==================================='
  }


  return result;

}
module.exports=function bestCharge(selectedItems) {
  let selected_items =transSelectedItem(selectedItems);
  let allitems_detail =getDetailItems(selected_items);
  let half_price_result = halfPrice(allitems_detail);
  let rebate_price_result = debatePrice(allitems_detail);
  let result=printResult(allitems_detail,half_price_result,rebate_price_result)
  return result;
}


