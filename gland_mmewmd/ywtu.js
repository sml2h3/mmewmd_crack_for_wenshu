function _$go(_$EO) {
    function _$az() {
        var _$BF = _$h7[_$EO.charCodeAt(_$fq++)];
        if (_$BF < 0) {
            return _$h7[_$EO.charCodeAt(_$fq++)] * 7396 + _$h7[_$EO.charCodeAt(_$fq++)] * 86 + _$h7[_$EO.charCodeAt(_$fq++)];
        } else if (_$BF < 64) {
            return _$BF;
        } else if (_$BF <= 86) {
            return _$BF * 86 + _$h7[_$EO.charCodeAt(_$fq++)] - 5440;
        }
    }

    var _$pM = _$EO.length, _$fq = 0, _$EA, _$Cz = 0, _$h7 = _$z0()[5];
    var _$Ea = _$az();
    _$kI = _$Hi(_$kI);
    _$FM = _$Hi(_$FM);
    var _$zG = new Array(_$Ea);
    while (_$fq < _$pM) {
        _$EA = _$az();
        _$zG[_$Cz++] = _$EO.substr(_$fq, _$EA);
        _$fq += _$EA;
    }
    _$Hc = function (_$BF) {
        var _$Cl = _$BF % 64;
        var _$Cs = _$BF - _$Cl;
        _$Cl = _$nM(_$Cl);
        _$Cl ^= _$kI;
        _$Cs += _$Cl;
        return _$zG[_$Cs];
    };
}
function _$nM(_$Cz) {
    var _$h7 = [0, 1, 3, 7, 0xf, 0x1f];
    return (_$Cz >> _$FM) | ((_$Cz & _$h7[_$FM]) << (6 - _$FM));
}
function _$Hi(_$Cz, _$h7) {
    _$Cz = parseInt(_$Cz);
    if (!isNaN(_$Cz)) return _$Cz;
    if (arguments.length > 1) return _$h7;
    return NaN;
}

function _$pZ(){
    return ""
}

function _$xR() {
    return "qrcklmDoExthWJiHAp1sVYKU3RFMQw8IGfPO92bvLNj.7zXBaSnu0TC6gy_4Ze5d{}|~ !#$%()*+,-:=?@[]^".split(_$pZ());
}

function _$zh(_$h7, _$Cz, _$fq, _$Ea) {
    for (; _$Cz < _$fq; _$Cz++) {
        _$h7[_$Cz] = _$Ea;
    }
}

function _$wV() {
    var _$fq = _$xR();
    var _$Cz = [];
    for (var _$az = 0; _$az < 6; _$az++) {
        _$Cz[_$az] = [];
    }
    _$z0 = function () {
        return _$Cz;
    };
    var _$pM = _$Cz[0], _$Ea = _$Cz[1], _$EA = _$Cz[2], _$EO = _$Cz[3], _$ht = _$Cz[4], _$h7 = _$Cz[5];
    _$zh(_$h7, 0, 255, -1);
    for (_$az = 0; _$az < _$fq.length; _$az++) {
        var _$zG = _$fq[_$az].charCodeAt(0);
        _$pM[_$zG] = _$az << 2;
        _$Ea[_$zG] = _$az >> 4;
        _$EA[_$zG] = (_$az & 15) << 4;
        _$EO[_$zG] = _$az >> 2;
        _$ht[_$zG] = (_$az & 3) << 6;
        _$h7[_$zG] = _$az;
    }
}

function _$Em() {
    return _$BI._$b0();
}
function _$vz() {
    return _$BI._$ap();
}
function _$qy(meta) {
    function _$Ea() {
        var _$zG = _$Cz.charCodeAt(_$pM);
        if (_$zG >= 40) {
            _$pM++;
            return _$zG - 40;
        }
        var _$EA = 39 - _$zG;
        _$zG = 0;
        for (var _$az = 0; _$az < _$EA; _$az++) {
            _$zG *= 87;
            _$zG += _$Cz.charCodeAt(_$pM + 1 + _$az) - 40;
        }
        _$pM += _$EA + 1;
        return _$zG + 87;
    }

    function _$EO() {
        var _$EA = _$Ea();
        var _$az = _$Cz.substr(_$pM, _$EA);
        _$pM += _$EA;
        return _$az;
    }

    function _$h7() {
        return _$Cz.substr(_$pM);
    }

    var _$Cz = meta, _$pM = 0, _$fq = {};
    _$fq._$b0 = _$EO;
    _$fq._$ap = _$h7;
    return _$fq;
}
var _$Hc = undefined;
// _$go(meta);
var _$BI = undefined;
var _$z0 = undefined;
function _$kw(){
    return "`"
}
function _$uV() {
    var _$h7 = _$DY(_$Em()).split(_$kw());
    for (var _$Cz = 0; _$Cz < _$h7.length; _$Cz++) _$h7[_$Cz] = _$Hi(_$h7[_$Cz]);
    return _$h7;
}

_$yS = _$Aw("qzs|u`v");

function _$fU(_$h7) {
    return _$h7[_$yS];
}

function _$Aw(_$fq) {
    var _$h7, _$EO = _$fq.length, _$EA = new Array(_$EO - 1);
    var _$Cz = _$fq.charCodeAt(0) - 93;
    for (var _$pM = 0, _$Ea = 1; _$Ea < _$EO; ++_$Ea) {
        _$h7 = _$fq.charCodeAt(_$Ea);
        if (_$h7 >= 40 && _$h7 < 92) {
            _$h7 += _$Cz;
            if (_$h7 >= 92) _$h7 = _$h7 - 52;
        } else if (_$h7 >= 93 && _$h7 < 127) {
            _$h7 += _$Cz;
            if (_$h7 >= 127) _$h7 = _$h7 - 34;
        }
        _$EA[_$pM++] = _$h7;
    }
    return String.fromCharCode.apply(null, _$EA);
}

function _$DY(_$fq) {
    var _$h7, _$EO = _$fU(_$fq), _$EA = new Array(_$EO - 1);
    var _$Cz = _$fq.charCodeAt(0) - 40;
    for (var _$pM = 0, _$Ea = 1; _$Ea < _$EO; ++_$Ea) {
        _$h7 = _$fq.charCodeAt(_$Ea);
        if (_$h7 >= 40 && _$h7 < 127) {
            _$h7 += _$Cz;
            if (_$h7 >= 127) _$h7 = _$h7 - 87;
        }
        _$EA[_$pM++] = _$h7;
    }
    return String.fromCharCode.apply(null, _$EA);
}

function getc(meta){
    _$BI = _$qy(meta);
    for(var i = 0; i < 11; i++){
        var _$Ea = _$uV();
    }
    _$kI = _$Ea[1];
    _$D1 = _$Ea[0];
    _$FM = _$Ea[2];
    _$Em();
    var r = _$vz();
    _$wV();
    _$go(r);
    return _$Hc(26)
}

/**
 *
 * developer: sml2h3
 * time: 2019.1.20
 * GitHub：https://github.com/sml2h3
 * QQ group:119794042
 */

