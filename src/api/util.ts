import {BigNumber} from "bignumber.js";
import copy from "copy-to-clipboard";

// 10的N 次方
export const Power = (arg: string) => {
  let newPower = new BigNumber(10);
  return newPower.pow(arg);
};

// 加法
export const Plus = (nu: string, arg: string) => {
  let newPlus = new BigNumber(nu);
  return newPlus.plus(arg);
};

// 减法
export const Minus = (nu: string, arg: string) => {
  let newMinus = new BigNumber(nu);
  return newMinus.minus(arg);
};

// 乘法
export const Times = (nu: string, arg: string) => {
  let newTimes = new BigNumber(nu);
  return newTimes.times(arg);
};

// 除法
export const Division = (nu: string, arg: string) => {
  let newDiv = new BigNumber(nu);
  return newDiv.div(arg);
};

// 数字乘以精度系数
export const timesDecimals = (nu: string, decimals: number) => {
  if (decimals === 0) {
    return nu
  }
  return new BigNumber(Times(nu, Power(decimals.toString()).toString()))
    .toFormat()
    .replace(/[,]/g, "");
};

/**
 * 数字除以精度系数
 */
export const divisionDecimals = (nu: string, decimals: number) => {
  if (decimals === 0) {
    return nu;
  }
  return new BigNumber(Division(nu, Power(decimals.toString()).toString()))
    .toFormat()
    .replace(/[,]/g, "");
};

/**
 * 保留指定小数位数
 * @param val 要处理的数据，Number | String
 * @param len 保留小数位数，位数不足时，以0填充
 * @param side 1|-1 对应 入|舍
 * @returns {string|number}
 */
export const tofix = (val: string, len: number, side: number) => {
  const numval = Number(val);
  if (isNaN(numval)) return 0;
  const str = val.toString();
  if (str.indexOf('.') > -1) {
    let numArr = str.split('.');
    if (numArr[1].length > len) {
      let tempnum = numval * Math.pow(10, len);
      if (!side) {
        return Number(val).toFixed(len)
      } else if (side === 1) {
        if (tempnum < 1) return (1 / Math.pow(10, len));
        return (Math.ceil(tempnum) / Math.pow(10, len)).toFixed(len)
      } else if (side === -1) {
        return (Math.floor(tempnum) / Math.pow(10, len)).toFixed(len)
      } else {
        return Number(Number(val).toFixed(len))
      }
    } else {
      return Number(str).toFixed(len)
    }
  } else {
    return Number(val).toFixed(len)
  }
};

/**
 * @disc: 复制
 * @params:
 * @date: 2021-05-21 14:19
 * @author: Wave
 */
export const copys = (val: string) => {
  return copy(val);
};

/**
 * @disc: 字符串中间显示...
 * @params:
 * @date: 2021-05-18 16:33
 * @author: Wave
 */
export const superLong = (str: string, len: number) => {
  if (str && str.length > 10) {
    return (
      str.substr(0, len) +
      "...." +
      str.substr(str.length - len, str.length)
    );
  } else {
    return str;
  }
};
