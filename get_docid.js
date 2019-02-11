/*
 *  解密DocID
 */
 window = {};
(function(global) {
    'use strict';
    if (global.Base64_Zip){
        //alert("1");
        //return;

    }
    var version = "2.1.1";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        buffer = require('buffer').Buffer;
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var Base64_btoa =  function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer
        ? function (u) { return (new buffer(u)).toString('base64') }
    : function (u) { return Base64_btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(u)
            : _encode(u).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var Base64_atob = function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer
        ? function(a) { return (new buffer(a, 'base64')).toString() }
    : function(a) { return btou(Base64_atob(a)) };
    var decode = function(a){
        return _decode(
            a.replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    // export Base64
    global.Base64_Zip = {
        VERSION: version,
        atob: Base64_atob,
        btoa: Base64_btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64_Zip.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
})(window);
(function(ctx){
    /* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0.0.1
     * LastModified: Dec 25 1999
     */

    /* Interface:
     * data = zip_inflate(src);
     */

    /* constant parameters */
    var zip_WSIZE = 32768;      // Sliding Window size
    var zip_STORED_BLOCK = 0;
    var zip_STATIC_TREES = 1;
    var zip_DYN_TREES    = 2;

    /* for inflate */
    var zip_lbits = 9;      // bits in base literal/length lookup table
    var zip_dbits = 6;      // bits in base distance lookup table
    var zip_INBUFSIZ = 32768;   // Input buffer size
    var zip_INBUF_EXTRA = 64;   // Extra buffer

    /* variables (inflate) */
    var zip_slide;
    var zip_wp;         // current position in slide
    var zip_fixed_tl = null;    // inflate static
    var zip_fixed_td;       // inflate static
    var zip_fixed_bl, zip_fixed_bd; // inflate static
    var zip_bit_buf;        // bit buffer
    var zip_bit_len;        // bits in bit buffer
    var zip_method;
    var zip_eof;
    var zip_copy_leng;
    var zip_copy_dist;
    var zip_tl, zip_td; // literal/length and distance decoder tables
    var zip_bl, zip_bd; // number of bits decoded by tl and td

    var zip_inflate_data;
    var zip_inflate_pos;


    /* constant tables (inflate) */
    var zip_MASK_BITS = new Array(
        0x0000,
        0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
        0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
    // Tables for deflate from PKZIP's appnote.txt.
    var zip_cplens = new Array( // Copy lengths for literal codes 257..285
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
    /* note: see note #13 above about the 258 in this list. */
    var zip_cplext = new Array( // Extra bits for literal codes 257..285
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
    var zip_cpdist = new Array( // Copy offsets for distance codes 0..29
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
        257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
        8193, 12289, 16385, 24577);
    var zip_cpdext = new Array( // Extra bits for distance codes
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
        7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
        12, 12, 13, 13);
    var zip_border = new Array(  // Order of the bit length code lengths
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
    /* objects (inflate) */

    var zip_HuftList = function() {
        this.next = null;
        this.list = null;
    }

    var zip_HuftNode = function() {
        this.e = 0; // number of extra bits or operation
        this.b = 0; // number of bits in this code or subcode

        // union
        this.n = 0; // literal, length base, or distance base
        this.t = null; // (zip_HuftNode) pointer to next level of table
    }

    var zip_HuftBuild = function(b, // code lengths in bits (all assumed <= BMAX)
                   n,   // number of codes (assumed <= N_MAX)
                   s,   // number of simple-valued codes (0..s-1)
                   d,   // list of base values for non-simple codes
                   e,   // list of extra bits for non-simple codes
                   mm   // maximum lookup bits
               ) {
        this.BMAX = 16;   // maximum bit length of any code
        this.N_MAX = 288; // maximum number of codes in any set
        this.status = 0;    // 0: success, 1: incomplete table, 2: bad input
        this.root = null;   // (zip_HuftList) starting table
        this.m = 0;     // maximum lookup bits, returns actual

    /* Given a list of code lengths and a maximum table size, make a set of
       tables to decode that set of codes.  Return zero on success, one if
       the given code set is incomplete (the tables are still built in this
       case), two if the input is invalid (all zero length codes or an
       oversubscribed set of lengths), and three if not enough memory.
       The code with value 256 is special, and the tables are constructed
       so that no bits beyond that code are fetched when that code is
       decoded. */
        {
        var a;          // counter for codes of length k
        var c = new Array(this.BMAX+1); // bit length count table
        var el;         // length of EOB code (value 256)
        var f;          // i repeats in table every f entries
        var g;          // maximum code length
        var h;          // table level
        var i;          // counter, current code
        var j;          // counter
        var k;          // number of bits in current code
        var lx = new Array(this.BMAX+1);    // stack of bits per table
        var p;          // pointer into c[], b[], or v[]
        var pidx;       // index of p
        var q;          // (zip_HuftNode) points to current table
        var r = new zip_HuftNode(); // table entry for structure assignment
        var u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
        var v = new Array(this.N_MAX); // values in order of bit length
        var w;
        var x = new Array(this.BMAX+1);// bit offsets, then code stack
        var xp;         // pointer into x or c
        var y;          // number of dummy codes added
        var z;          // number of entries in current table
        var o;
        var tail;       // (zip_HuftList)

        tail = this.root = null;
        for(i = 0; i < c.length; i++)
            c[i] = 0;
        for(i = 0; i < lx.length; i++)
            lx[i] = 0;
        for(i = 0; i < u.length; i++)
            u[i] = null;
        for(i = 0; i < v.length; i++)
            v[i] = 0;
        for(i = 0; i < x.length; i++)
            x[i] = 0;

        // Generate counts for each bit length
        el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
        p = b; pidx = 0;
        i = n;
        do {
            c[p[pidx]]++;   // assume all entries <= BMAX
            pidx++;
        } while(--i > 0);
        if(c[0] == n) { // null input--all zero length codes
            this.root = null;
            this.m = 0;
            this.status = 0;
            return;
        }

        // Find minimum and maximum length, bound *m by those
        for(j = 1; j <= this.BMAX; j++)
            if(c[j] != 0)
            break;
        k = j;          // minimum code length
        if(mm < j)
            mm = j;
        for(i = this.BMAX; i != 0; i--)
            if(c[i] != 0)
            break;
        g = i;          // maximum code length
        if(mm > i)
            mm = i;

        // Adjust last length count to fill out codes, if needed
        for(y = 1 << j; j < i; j++, y <<= 1)
            if((y -= c[j]) < 0) {
            this.status = 2;    // bad input: more codes than bits
            this.m = mm;
            return;
            }
        if((y -= c[i]) < 0) {
            this.status = 2;
            this.m = mm;
            return;
        }
        c[i] += y;

        // Generate starting offsets into the value table for each length
        x[1] = j = 0;
        p = c;
        pidx = 1;
        xp = 2;
        while(--i > 0)      // note that i == g from above
            x[xp++] = (j += p[pidx++]);

        // Make a table of values in order of bit lengths
        p = b; pidx = 0;
        i = 0;
        do {
            if((j = p[pidx++]) != 0)
            v[x[j]++] = i;
        } while(++i < n);
        n = x[g];           // set n to length of v

        // Generate the Huffman codes and for each, make the table entries
        x[0] = i = 0;       // first Huffman code is zero
        p = v; pidx = 0;        // grab values in bit order
        h = -1;         // no tables yet--level -1
        w = lx[0] = 0;      // no bits decoded yet
        q = null;           // ditto
        z = 0;          // ditto

        // go through the bit lengths (k already is bits in shortest code)
        for(; k <= g; k++) {
            a = c[k];
            while(a-- > 0) {
            // here i is the Huffman code of length k bits for value p[pidx]
            // make tables up to required level
            while(k > w + lx[1 + h]) {
                w += lx[1 + h]; // add bits already decoded
                h++;

                // compute minimum size table less than or equal to *m bits
                z = (z = g - w) > mm ? mm : z; // upper limit
                if((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
                // too few codes for k-w bit table
                f -= a + 1; // deduct codes from patterns left
                xp = k;
                while(++j < z) { // try smaller tables up to z bits
                    if((f <<= 1) <= c[++xp])
                    break;  // enough codes to use up j bits
                    f -= c[xp]; // else deduct codes from patterns
                }
                }
                if(w + j > el && w < el)
                j = el - w; // make EOB code end at table
                z = 1 << j; // table entries for j-bit table
                lx[1 + h] = j; // set table size in stack

                // allocate and link in new table
                q = new Array(z);
                for(o = 0; o < z; o++) {
                q[o] = new zip_HuftNode();
                }

                if(tail == null)
                tail = this.root = new zip_HuftList();
                else
                tail = tail.next = new zip_HuftList();
                tail.next = null;
                tail.list = q;
                u[h] = q;   // table starts after link

                /* connect to last table, if there is one */
                if(h > 0) {
                x[h] = i;       // save pattern for backing up
                r.b = lx[h];    // bits to dump before this table
                r.e = 16 + j;   // bits in this table
                r.t = q;        // pointer to this table
                j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                u[h-1][j].e = r.e;
                u[h-1][j].b = r.b;
                u[h-1][j].n = r.n;
                u[h-1][j].t = r.t;
                }
            }

            // set up table entry in r
            r.b = k - w;
            if(pidx >= n)
                r.e = 99;       // out of values--invalid code
            else if(p[pidx] < s) {
                r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
                r.n = p[pidx++];    // simple code is just the value
            } else {
                r.e = e[p[pidx] - s];   // non-simple--look up in lists
                r.n = d[p[pidx++] - s];
            }

            // fill code-like entries with r //
            f = 1 << (k - w);
            for(j = i >> w; j < z; j += f) {
                q[j].e = r.e;
                q[j].b = r.b;
                q[j].n = r.n;
                q[j].t = r.t;
            }

            // backwards increment the k-bit code i
            for(j = 1 << (k - 1); (i & j) != 0; j >>= 1)
                i ^= j;
            i ^= j;

            // backup over finished tables
            while((i & ((1 << w) - 1)) != x[h]) {
                w -= lx[h];     // don't need to update q
                h--;
            }
            }
        }

        /* return actual size of base table */
        this.m = lx[1];

        /* Return true (1) if we were given an incomplete table */
        this.status = ((y != 0 && g != 1) ? 1 : 0);
        } /* end of constructor */
    }


    /* routines (inflate) */

    var zip_GET_BYTE = function() {
        if(zip_inflate_data.length == zip_inflate_pos)
        return -1;
        var charcode = zip_inflate_data.charCodeAt(zip_inflate_pos++);
        return  charcode & 0xff;
    }

    var zip_NEEDBITS = function(n) {
        while(zip_bit_len < n) {
        zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
        zip_bit_len += 8;
        }
    }

    var zip_GETBITS = function(n) {
        return zip_bit_buf & zip_MASK_BITS[n];
    }

    var zip_DUMPBITS = function(n) {
        zip_bit_buf >>= n;
        zip_bit_len -= n;
    }

    var zip_inflate_codes = function(buff, off, size) {
        /* inflate (decompress) the codes in a deflated (compressed) block.
           Return an error code or zero if it all goes ok. */
        var e;      // table entry flag/number of extra bits
        var t;      // (zip_HuftNode) pointer to table entry
        var n;

        if(size == 0)
          return 0;

        // inflate the coded data
        n = 0;
        for(;;) {           // do until end of block
        zip_NEEDBITS(zip_bl);
        t = zip_tl.list[zip_GETBITS(zip_bl)];
        e = t.e;
        while(e > 16) {
            if(e == 99)
            return -1;
            zip_DUMPBITS(t.b);
            e -= 16;
            zip_NEEDBITS(e);
            t = t.t[zip_GETBITS(e)];
            e = t.e;
        }
        zip_DUMPBITS(t.b);

        if(e == 16) {       // then it's a literal
            zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_slide[zip_wp++] = t.n;
            if(n == size)
            return size;
            continue;
        }

        // exit if end of block
        if(e == 15)
            break;

        // it's an EOB or a length

        // get length of block to copy
        zip_NEEDBITS(e);
        zip_copy_leng = t.n + zip_GETBITS(e);
        zip_DUMPBITS(e);

        // decode distance of block to copy
        zip_NEEDBITS(zip_bd);
        t = zip_td.list[zip_GETBITS(zip_bd)];
        e = t.e;

        while(e > 16) {
            if(e == 99)
            return -1;
            zip_DUMPBITS(t.b);
            e -= 16;
            zip_NEEDBITS(e);
            t = t.t[zip_GETBITS(e)];
            e = t.e;
        }
        zip_DUMPBITS(t.b);
        zip_NEEDBITS(e);
        zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
        zip_DUMPBITS(e);

        // do the copy
        while(zip_copy_leng > 0 && n < size) {
            zip_copy_leng--;
            zip_copy_dist &= zip_WSIZE - 1;
            zip_wp &= zip_WSIZE - 1;
            buff[off + n++] = zip_slide[zip_wp++]
            = zip_slide[zip_copy_dist++];
        }

        if(n == size)
            return size;
        }

        zip_method = -1; // done
        return n;
    }

    var zip_inflate_stored = function(buff, off, size) {
        /* "decompress" an inflated type 0 (stored) block. */
        var n;

        // go to byte boundary
        n = zip_bit_len & 7;
        zip_DUMPBITS(n);

        // get the length and its complement
        zip_NEEDBITS(16);
        n = zip_GETBITS(16);
        zip_DUMPBITS(16);
        zip_NEEDBITS(16);
        if(n != ((~zip_bit_buf) & 0xffff))
        return -1;          // error in compressed data
        zip_DUMPBITS(16);

        // read and output the compressed data
        zip_copy_leng = n;

        n = 0;
        while(zip_copy_leng > 0 && n < size) {
        zip_copy_leng--;
        zip_wp &= zip_WSIZE - 1;
        zip_NEEDBITS(8);
        buff[off + n++] = zip_slide[zip_wp++] =
            zip_GETBITS(8);
        zip_DUMPBITS(8);
        }

        if(zip_copy_leng == 0)
          zip_method = -1; // done
        return n;
    }

    var zip_inflate_fixed = function(buff, off, size) {
        /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
           either replace this with a custom decoder, or at least precompute the
           Huffman tables. */

        // if first time, set up tables for fixed blocks
        if(zip_fixed_tl == null) {
        var i;          // temporary variable
        var l = new Array(288); // length list for huft_build
        var h;  // zip_HuftBuild

        // literal table
        for(i = 0; i < 144; i++)
            l[i] = 8;
        for(; i < 256; i++)
            l[i] = 9;
        for(; i < 280; i++)
            l[i] = 7;
        for(; i < 288; i++) // make a complete, but wrong code set
            l[i] = 8;
        zip_fixed_bl = 7;

        h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
                      zip_fixed_bl);
        if(h.status != 0) {
            alert("HufBuild error: "+h.status);
            return -1;
        }
        zip_fixed_tl = h.root;
        zip_fixed_bl = h.m;

        // distance table
        for(i = 0; i < 30; i++) // make an incomplete code set
            l[i] = 5;
        zip_fixed_bd = 5;

        h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
        if(h.status > 1) {
            zip_fixed_tl = null;
            alert("HufBuild error: "+h.status);
            return -1;
        }
        zip_fixed_td = h.root;
        zip_fixed_bd = h.m;
        }

        zip_tl = zip_fixed_tl;
        zip_td = zip_fixed_td;
        zip_bl = zip_fixed_bl;
        zip_bd = zip_fixed_bd;
        return zip_inflate_codes(buff, off, size);
    }

    var zip_inflate_dynamic = function(buff, off, size) {
        // decompress an inflated type 2 (dynamic Huffman codes) block.
        var i;      // temporary variables
        var j;
        var l;      // last length
        var n;      // number of lengths to get
        var t;      // (zip_HuftNode) literal/length code table
        var nb;     // number of bit length codes
        var nl;     // number of literal/length codes
        var nd;     // number of distance codes
        var ll = new Array(286+30); // literal/length and distance code lengths
        var h;      // (zip_HuftBuild)

        for(i = 0; i < ll.length; i++)
        ll[i] = 0;

        // read in table lengths
        zip_NEEDBITS(5);
        nl = 257 + zip_GETBITS(5);  // number of literal/length codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(5);
        nd = 1 + zip_GETBITS(5);    // number of distance codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(4);
        nb = 4 + zip_GETBITS(4);    // number of bit length codes
        zip_DUMPBITS(4);
        if(nl > 286 || nd > 30)
          return -1;        // bad lengths

        // read in bit-length-code lengths
        for(j = 0; j < nb; j++)
        {
        zip_NEEDBITS(3);
        ll[zip_border[j]] = zip_GETBITS(3);
        zip_DUMPBITS(3);
        }
        for(; j < 19; j++)
        ll[zip_border[j]] = 0;

        // build decoding table for trees--single level, 7 bit lookup
        zip_bl = 7;
        h = new zip_HuftBuild(ll, 19, 19, null, null, zip_bl);
        if(h.status != 0)
        return -1;  // incomplete code set

        zip_tl = h.root;
        zip_bl = h.m;

        // read in literal and distance code lengths
        n = nl + nd;
        i = l = 0;
        while(i < n) {
        zip_NEEDBITS(zip_bl);
        t = zip_tl.list[zip_GETBITS(zip_bl)];
        j = t.b;
        zip_DUMPBITS(j);
        j = t.n;
        if(j < 16)      // length of code in bits (0..15)
            ll[i++] = l = j;    // save last length in l
        else if(j == 16) {  // repeat last length 3 to 6 times
            zip_NEEDBITS(2);
            j = 3 + zip_GETBITS(2);
            zip_DUMPBITS(2);
            if(i + j > n)
            return -1;
            while(j-- > 0)
            ll[i++] = l;
        } else if(j == 17) {    // 3 to 10 zero length codes
            zip_NEEDBITS(3);
            j = 3 + zip_GETBITS(3);
            zip_DUMPBITS(3);
            if(i + j > n)
            return -1;
            while(j-- > 0)
            ll[i++] = 0;
            l = 0;
        } else {        // j == 18: 11 to 138 zero length codes
            zip_NEEDBITS(7);
            j = 11 + zip_GETBITS(7);
            zip_DUMPBITS(7);
            if(i + j > n)
            return -1;
            while(j-- > 0)
            ll[i++] = 0;
            l = 0;
        }
        }

        // build the decoding tables for literal/length and distance codes
        zip_bl = zip_lbits;
        h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_bl);
        if(zip_bl == 0) // no literals or lengths
        h.status = 1;
        if(h.status != 0) {
        if(h.status == 1)
            ;// **incomplete literal tree**
        return -1;      // incomplete code set
        }
        zip_tl = h.root;
        zip_bl = h.m;

        for(i = 0; i < nd; i++)
        ll[i] = ll[i + nl];
        zip_bd = zip_dbits;
        h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_bd);
        zip_td = h.root;
        zip_bd = h.m;

        if(zip_bd == 0 && nl > 257) {   // lengths but no distances
        // **incomplete distance tree**
        return -1;
        }

        if(h.status == 1) {
        ;// **incomplete distance tree**
        }
        if(h.status != 0)
        return -1;

        // decompress until an end-of-block code
        return zip_inflate_codes(buff, off, size);
    }

    var zip_inflate_start = function() {
        var i;

        if(zip_slide == null)
        zip_slide = new Array(2 * zip_WSIZE);
        zip_wp = 0;
        zip_bit_buf = 0;
        zip_bit_len = 0;
        zip_method = -1;
        zip_eof = false;
        zip_copy_leng = zip_copy_dist = 0;
        zip_tl = null;
    }

    var zip_inflate_internal = function(buff, off, size) {
        // decompress an inflated entry
        var n, i;

        n = 0;
        while(n < size) {
        if(zip_eof && zip_method == -1)
            return n;

        if(zip_copy_leng > 0) {
            if(zip_method != zip_STORED_BLOCK) {
            // STATIC_TREES or DYN_TREES
            while(zip_copy_leng > 0 && n < size) {
                zip_copy_leng--;
                zip_copy_dist &= zip_WSIZE - 1;
                zip_wp &= zip_WSIZE - 1;
                buff[off + n++] = zip_slide[zip_wp++] =
                zip_slide[zip_copy_dist++];
            }
            } else {
            while(zip_copy_leng > 0 && n < size) {
                zip_copy_leng--;
                zip_wp &= zip_WSIZE - 1;
                zip_NEEDBITS(8);
                buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
                zip_DUMPBITS(8);
            }
            if(zip_copy_leng == 0)
                zip_method = -1; // done
            }
            if(n == size)
            return n;
        }

        if(zip_method == -1) {
            if(zip_eof)
            break;

            // read in last block bit
            zip_NEEDBITS(1);
            if(zip_GETBITS(1) != 0)
            zip_eof = true;
            zip_DUMPBITS(1);

            // read in block type
            zip_NEEDBITS(2);
            zip_method = zip_GETBITS(2);
            zip_DUMPBITS(2);
            zip_tl = null;
            zip_copy_leng = 0;
        }

        switch(zip_method) {
          case 0: // zip_STORED_BLOCK
            i = zip_inflate_stored(buff, off + n, size - n);
            break;

          case 1: // zip_STATIC_TREES
            if(zip_tl != null)
            i = zip_inflate_codes(buff, off + n, size - n);
            else
            i = zip_inflate_fixed(buff, off + n, size - n);
            break;

          case 2: // zip_DYN_TREES
            if(zip_tl != null)
            i = zip_inflate_codes(buff, off + n, size - n);
            else
            i = zip_inflate_dynamic(buff, off + n, size - n);
            break;

          default: // error
            i = -1;
            break;
        }

        if(i == -1) {
            if(zip_eof)
            return 0;
            return -1;
        }
        n += i;
        }
        return n;
    }

    var zip_inflate = function(str) {
        var i, j;

        zip_inflate_start();
        zip_inflate_data = str;
        zip_inflate_pos = 0;

        var buff = new Array(1024);
        var aout = [];
        while((i = zip_inflate_internal(buff, 0, buff.length)) > 0) {
        var cbuf = new Array(i);
        for(j = 0; j < i; j++){
            cbuf[j] = String.fromCharCode(buff[j]);
        }
        aout[aout.length] = cbuf.join("");
        }
        zip_inflate_data = null; // G.C.
        return aout.join("");
    }

    if (! ctx.RawDeflate) ctx.RawDeflate = {};
    ctx.RawDeflate.inflate = zip_inflate;

})(window);

function unzip(b64Data) {
        var strData ;
        if(!window.atob){
        //  strData = $.base64.atob(b64Data)
        }else{
        //  strData = atob(b64Data)
        }
        var charData ;
        if (!Array.prototype.map) {
         //  charData =iemap( strData.split(''),function (x) { return x.charCodeAt(0); },null);
        }else{
        //  charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
        }

        strData = window.Base64_Zip.btou(window.RawDeflate.inflate(window.Base64_Zip.fromBase64(b64Data)));
       // var binData = new Uint8Array(charData);
      //  var data = pako.inflate(binData);
      //  strData = String.fromCharCode.apply(null, new Uint16Array(data));
        return strData;
}

var CryptoJS = CryptoJS || function(u, p) {
    var d = {}
      , l = d.lib = {}
      , s = function() {}
      , t = l.Base = {
        extend: function(a) {
            s.prototype = this;
            var c = new s;
            a && c.mixIn(a);
            c.hasOwnProperty("init") || (c.init = function() {
                c.$super.init.apply(this, arguments)
            }
            );
            c.init.prototype = c;
            c.$super = this;
            return c
        },
        create: function() {
            var a = this.extend();
            a.init.apply(a, arguments);
            return a
        },
        init: function() {},
        mixIn: function(a) {
            for (var c in a)
                a.hasOwnProperty(c) && (this[c] = a[c]);
            a.hasOwnProperty("toString") && (this.toString = a.toString)
        },
        clone: function() {
            return this.init.prototype.extend(this)
        }
    }
      , r = l.WordArray = t.extend({
        init: function(a, c) {
            a = this.words = a || [];
            this.sigBytes = c != p ? c : 4 * a.length
        },
        toString: function(a) {
            return (a || v).stringify(this)
        },
        concat: function(a) {
            var c = this.words
              , e = a.words
              , j = this.sigBytes;
            a = a.sigBytes;
            this.clamp();
            if (j % 4)
                for (var k = 0; k < a; k++)
                    c[j + k >>> 2] |= (e[k >>> 2] >>> 24 - 8 * (k % 4) & 255) << 24 - 8 * ((j + k) % 4);
            else if (65535 < e.length)
                for (k = 0; k < a; k += 4)
                    c[j + k >>> 2] = e[k >>> 2];
            else
                c.push.apply(c, e);
            this.sigBytes += a;
            return this
        },
        clamp: function() {
            var a = this.words
              , c = this.sigBytes;
            a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
            a.length = u.ceil(c / 4)
        },
        clone: function() {
            var a = t.clone.call(this);
            a.words = this.words.slice(0);
            return a
        },
        random: function(a) {
            for (var c = [], e = 0; e < a; e += 4)
                c.push(4294967296 * u.random() | 0);
            return new r.init(c,a)
        }
    })
      , w = d.enc = {}
      , v = w.Hex = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var e = [], j = 0; j < a; j++) {
                var k = c[j >>> 2] >>> 24 - 8 * (j % 4) & 255;
                e.push((k >>> 4).toString(16));
                e.push((k & 15).toString(16))
            }
            return e.join("")
        },
        parse: function(a) {
            for (var c = a.length, e = [], j = 0; j < c; j += 2)
                e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << 24 - 4 * (j % 8);
            return new r.init(e,c / 2)
        }
    }
      , b = w.Latin1 = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var e = [], j = 0; j < a; j++)
                e.push(String.fromCharCode(c[j >>> 2] >>> 24 - 8 * (j % 4) & 255));
            return e.join("")
        },
        parse: function(a) {
            for (var c = a.length, e = [], j = 0; j < c; j++)
                e[j >>> 2] |= (a.charCodeAt(j) & 255) << 24 - 8 * (j % 4);
            return new r.init(e,c)
        }
    }
      , x = w.Utf8 = {
        stringify: function(a) {
            try {
                return decodeURIComponent(escape(b.stringify(a)))
            } catch (c) {
                throw Error("Malformed UTF-8 data");
            }
        },
        parse: function(a) {
            return b.parse(unescape(encodeURIComponent(a)))
        }
    }
      , q = l.BufferedBlockAlgorithm = t.extend({
        reset: function() {
            this._data = new r.init;
            this._nDataBytes = 0
        },
        _append: function(a) {
            "string" == typeof a && (a = x.parse(a));
            this._data.concat(a);
            this._nDataBytes += a.sigBytes
        },
        _process: function(a) {
            var c = this._data
              , e = c.words
              , j = c.sigBytes
              , k = this.blockSize
              , b = j / (4 * k)
              , b = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0);
            a = b * k;
            j = u.min(4 * a, j);
            if (a) {
                for (var q = 0; q < a; q += k)
                    this._doProcessBlock(e, q);
                q = e.splice(0, a);
                c.sigBytes -= j
            }
            return new r.init(q,j)
        },
        clone: function() {
            var a = t.clone.call(this);
            a._data = this._data.clone();
            return a
        },
        _minBufferSize: 0
    });
    l.Hasher = q.extend({
        cfg: t.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
        },
        reset: function() {
            q.reset.call(this);
            this._doReset()
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this
        },
        finalize: function(a) {
            a && this._append(a);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(b, e) {
                return (new a.init(e)).finalize(b)
            }
        },
        _createHmacHelper: function(a) {
            return function(b, e) {
                return (new n.HMAC.init(a,e)).finalize(b)
            }
        }
    });
    var n = d.algo = {};
    return d
}(Math);
(function() {
    var u = CryptoJS
      , p = u.lib.WordArray;
    u.enc.Base64 = {
        stringify: function(d) {
            var l = d.words
              , p = d.sigBytes
              , t = this._map;
            d.clamp();
            d = [];
            for (var r = 0; r < p; r += 3)
                for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++)
                    d.push(t.charAt(w >>> 6 * (3 - v) & 63));
            if (l = t.charAt(64))
                for (; d.length % 4; )
                    d.push(l);
            return d.join("")
        },
        parse: function(d) {
            var l = d.length
              , s = this._map
              , t = s.charAt(64);
            t && (t = d.indexOf(t),
            -1 != t && (l = t));
            for (var t = [], r = 0, w = 0; w < l; w++)
                if (w % 4) {
                    var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4)
                      , b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);
                    t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);
                    r++
                }
            return p.create(t, r)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
}
)();
(function(u) {
    function p(b, n, a, c, e, j, k) {
        b = b + (n & a | ~n & c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function d(b, n, a, c, e, j, k) {
        b = b + (n & c | a & ~c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function l(b, n, a, c, e, j, k) {
        b = b + (n ^ a ^ c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function s(b, n, a, c, e, j, k) {
        b = b + (a ^ (n | ~c)) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++)
        b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0;
    r = r.MD5 = v.extend({
        _doReset: function() {
            this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function(q, n) {
            for (var a = 0; 16 > a; a++) {
                var c = n + a
                  , e = q[c];
                q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360
            }
            var a = this._hash.words
              , c = q[n + 0]
              , e = q[n + 1]
              , j = q[n + 2]
              , k = q[n + 3]
              , z = q[n + 4]
              , r = q[n + 5]
              , t = q[n + 6]
              , w = q[n + 7]
              , v = q[n + 8]
              , A = q[n + 9]
              , B = q[n + 10]
              , C = q[n + 11]
              , u = q[n + 12]
              , D = q[n + 13]
              , E = q[n + 14]
              , x = q[n + 15]
              , f = a[0]
              , m = a[1]
              , g = a[2]
              , h = a[3]
              , f = p(f, m, g, h, c, 7, b[0])
              , h = p(h, f, m, g, e, 12, b[1])
              , g = p(g, h, f, m, j, 17, b[2])
              , m = p(m, g, h, f, k, 22, b[3])
              , f = p(f, m, g, h, z, 7, b[4])
              , h = p(h, f, m, g, r, 12, b[5])
              , g = p(g, h, f, m, t, 17, b[6])
              , m = p(m, g, h, f, w, 22, b[7])
              , f = p(f, m, g, h, v, 7, b[8])
              , h = p(h, f, m, g, A, 12, b[9])
              , g = p(g, h, f, m, B, 17, b[10])
              , m = p(m, g, h, f, C, 22, b[11])
              , f = p(f, m, g, h, u, 7, b[12])
              , h = p(h, f, m, g, D, 12, b[13])
              , g = p(g, h, f, m, E, 17, b[14])
              , m = p(m, g, h, f, x, 22, b[15])
              , f = d(f, m, g, h, e, 5, b[16])
              , h = d(h, f, m, g, t, 9, b[17])
              , g = d(g, h, f, m, C, 14, b[18])
              , m = d(m, g, h, f, c, 20, b[19])
              , f = d(f, m, g, h, r, 5, b[20])
              , h = d(h, f, m, g, B, 9, b[21])
              , g = d(g, h, f, m, x, 14, b[22])
              , m = d(m, g, h, f, z, 20, b[23])
              , f = d(f, m, g, h, A, 5, b[24])
              , h = d(h, f, m, g, E, 9, b[25])
              , g = d(g, h, f, m, k, 14, b[26])
              , m = d(m, g, h, f, v, 20, b[27])
              , f = d(f, m, g, h, D, 5, b[28])
              , h = d(h, f, m, g, j, 9, b[29])
              , g = d(g, h, f, m, w, 14, b[30])
              , m = d(m, g, h, f, u, 20, b[31])
              , f = l(f, m, g, h, r, 4, b[32])
              , h = l(h, f, m, g, v, 11, b[33])
              , g = l(g, h, f, m, C, 16, b[34])
              , m = l(m, g, h, f, E, 23, b[35])
              , f = l(f, m, g, h, e, 4, b[36])
              , h = l(h, f, m, g, z, 11, b[37])
              , g = l(g, h, f, m, w, 16, b[38])
              , m = l(m, g, h, f, B, 23, b[39])
              , f = l(f, m, g, h, D, 4, b[40])
              , h = l(h, f, m, g, c, 11, b[41])
              , g = l(g, h, f, m, k, 16, b[42])
              , m = l(m, g, h, f, t, 23, b[43])
              , f = l(f, m, g, h, A, 4, b[44])
              , h = l(h, f, m, g, u, 11, b[45])
              , g = l(g, h, f, m, x, 16, b[46])
              , m = l(m, g, h, f, j, 23, b[47])
              , f = s(f, m, g, h, c, 6, b[48])
              , h = s(h, f, m, g, w, 10, b[49])
              , g = s(g, h, f, m, E, 15, b[50])
              , m = s(m, g, h, f, r, 21, b[51])
              , f = s(f, m, g, h, u, 6, b[52])
              , h = s(h, f, m, g, k, 10, b[53])
              , g = s(g, h, f, m, B, 15, b[54])
              , m = s(m, g, h, f, e, 21, b[55])
              , f = s(f, m, g, h, v, 6, b[56])
              , h = s(h, f, m, g, x, 10, b[57])
              , g = s(g, h, f, m, t, 15, b[58])
              , m = s(m, g, h, f, D, 21, b[59])
              , f = s(f, m, g, h, z, 6, b[60])
              , h = s(h, f, m, g, C, 10, b[61])
              , g = s(g, h, f, m, j, 15, b[62])
              , m = s(m, g, h, f, A, 21, b[63]);
            a[0] = a[0] + f | 0;
            a[1] = a[1] + m | 0;
            a[2] = a[2] + g | 0;
            a[3] = a[3] + h | 0
        },
        _doFinalize: function() {
            var b = this._data
              , n = b.words
              , a = 8 * this._nDataBytes
              , c = 8 * b.sigBytes;
            n[c >>> 5] |= 128 << 24 - c % 32;
            var e = u.floor(a / 4294967296);
            n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
            n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            b.sigBytes = 4 * (n.length + 1);
            this._process();
            b = this._hash;
            n = b.words;
            for (a = 0; 4 > a; a++)
                c = n[a],
                n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
            return b
        },
        clone: function() {
            var b = v.clone.call(this);
            b._hash = this._hash.clone();
            return b
        }
    });
    t.MD5 = v._createHelper(r);
    t.HmacMD5 = v._createHmacHelper(r)
}
)(Math);
(function() {
    var u = CryptoJS
      , p = u.lib
      , d = p.Base
      , l = p.WordArray
      , p = u.algo
      , s = p.EvpKDF = d.extend({
        cfg: d.extend({
            keySize: 4,
            hasher: p.MD5,
            iterations: 1
        }),
        init: function(d) {
            this.cfg = this.cfg.extend(d)
        },
        compute: function(d, r) {
            for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q; ) {
                n && s.update(n);
                var n = s.update(d).finalize(r);
                s.reset();
                for (var a = 1; a < p; a++)
                    n = s.finalize(n),
                    s.reset();
                b.concat(n)
            }
            b.sigBytes = 4 * q;
            return b
        }
    });
    u.EvpKDF = function(d, l, p) {
        return s.create(p).compute(d, l)
    }
}
)();
CryptoJS.lib.Cipher || function(u) {
    var p = CryptoJS
      , d = p.lib
      , l = d.Base
      , s = d.WordArray
      , t = d.BufferedBlockAlgorithm
      , r = p.enc.Base64
      , w = p.algo.EvpKDF
      , v = d.Cipher = t.extend({
        cfg: l.extend(),
        createEncryptor: function(e, a) {
            return this.create(this._ENC_XFORM_MODE, e, a)
        },
        createDecryptor: function(e, a) {
            return this.create(this._DEC_XFORM_MODE, e, a)
        },
        init: function(e, a, b) {
            this.cfg = this.cfg.extend(b);
            this._xformMode = e;
            this._key = a;
            this.reset()
        },
        reset: function() {
            t.reset.call(this);
            this._doReset()
        },
        process: function(e) {
            this._append(e);
            return this._process()
        },
        finalize: function(e) {
            e && this._append(e);
            return this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(e) {
            return {
                encrypt: function(b, k, d) {
                    return ("string" == typeof k ? c : a).encrypt(e, b, k, d)
                },
                decrypt: function(b, k, d) {
                    return ("string" == typeof k ? c : a).decrypt(e, b, k, d)
                }
            }
        }
    });
    d.StreamCipher = v.extend({
        _doFinalize: function() {
            return this._process(!0)
        },
        blockSize: 1
    });
    var b = p.mode = {}
      , x = function(e, a, b) {
        var c = this._iv;
        c ? this._iv = u : c = this._prevBlock;
        for (var d = 0; d < b; d++)
            e[a + d] ^= c[d]
    }
      , q = (d.BlockCipherMode = l.extend({
        createEncryptor: function(e, a) {
            return this.Encryptor.create(e, a)
        },
        createDecryptor: function(e, a) {
            return this.Decryptor.create(e, a)
        },
        init: function(e, a) {
            this._cipher = e;
            this._iv = a
        }
    })).extend();
    q.Encryptor = q.extend({
        processBlock: function(e, a) {
            var b = this._cipher
              , c = b.blockSize;
            x.call(this, e, a, c);
            b.encryptBlock(e, a);
            this._prevBlock = e.slice(a, a + c)
        }
    });
    q.Decryptor = q.extend({
        processBlock: function(e, a) {
            var b = this._cipher
              , c = b.blockSize
              , d = e.slice(a, a + c);
            b.decryptBlock(e, a);
            x.call(this, e, a, c);
            this._prevBlock = d
        }
    });
    b = b.CBC = q;
    q = (p.pad = {}).Pkcs7 = {
        pad: function(a, b) {
            for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4)
                l.push(d);
            c = s.create(l, c);
            a.concat(c)
        },
        unpad: function(a) {
            a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255
        }
    };
    d.BlockCipher = v.extend({
        cfg: v.cfg.extend({
            mode: b,
            padding: q
        }),
        reset: function() {
            v.reset.call(this);
            var a = this.cfg
              , b = a.iv
              , a = a.mode;
            if (this._xformMode == this._ENC_XFORM_MODE)
                var c = a.createEncryptor;
            else
                c = a.createDecryptor,
                this._minBufferSize = 1;
            this._mode = c.call(a, this, b && b.words)
        },
        _doProcessBlock: function(a, b) {
            this._mode.processBlock(a, b)
        },
        _doFinalize: function() {
            var a = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                a.pad(this._data, this.blockSize);
                var b = this._process(!0)
            } else
                b = this._process(!0),
                a.unpad(b);
            return b
        },
        blockSize: 4
    });
    var n = d.CipherParams = l.extend({
        init: function(a) {
            this.mixIn(a)
        },
        toString: function(a) {
            return (a || this.formatter).stringify(this)
        }
    })
      , b = (p.format = {}).OpenSSL = {
        stringify: function(a) {
            var b = a.ciphertext;
            a = a.salt;
            return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r)
        },
        parse: function(a) {
            a = r.parse(a);
            var b = a.words;
            if (1398893684 == b[0] && 1701076831 == b[1]) {
                var c = s.create(b.slice(2, 4));
                b.splice(0, 4);
                a.sigBytes -= 16
            }
            return n.create({
                ciphertext: a,
                salt: c
            })
        }
    }
      , a = d.SerializableCipher = l.extend({
        cfg: l.extend({
            format: b
        }),
        encrypt: function(a, b, c, d) {
            d = this.cfg.extend(d);
            var l = a.createEncryptor(c, d);
            b = l.finalize(b);
            l = l.cfg;
            return n.create({
                ciphertext: b,
                key: c,
                iv: l.iv,
                algorithm: a,
                mode: l.mode,
                padding: l.padding,
                blockSize: a.blockSize,
                formatter: d.format
            })
        },
        decrypt: function(a, b, c, d) {
            d = this.cfg.extend(d);
            b = this._parse(b, d.format);
            return a.createDecryptor(c, d).finalize(b.ciphertext)
        },
        _parse: function(a, b) {
            return "string" == typeof a ? b.parse(a, this) : a
        }
    })
      , p = (p.kdf = {}).OpenSSL = {
        execute: function(a, b, c, d) {
            d || (d = s.random(8));
            a = w.create({
                keySize: b + c
            }).compute(a, d);
            c = s.create(a.words.slice(b), 4 * c);
            a.sigBytes = 4 * b;
            return n.create({
                key: a,
                iv: c,
                salt: d
            })
        }
    }
      , c = d.PasswordBasedCipher = a.extend({
        cfg: a.cfg.extend({
            kdf: p
        }),
        encrypt: function(b, c, d, l) {
            l = this.cfg.extend(l);
            d = l.kdf.execute(d, b.keySize, b.ivSize);
            l.iv = d.iv;
            b = a.encrypt.call(this, b, c, d.key, l);
            b.mixIn(d);
            return b
        },
        decrypt: function(b, c, d, l) {
            l = this.cfg.extend(l);
            c = this._parse(c, l.format);
            d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);
            l.iv = d.iv;
            return a.decrypt.call(this, b, c, d.key, l)
        }
    })
}();
(function() {
    for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++)
        a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
    for (var e = 0, j = 0, c = 0; 256 > c; c++) {
        var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4
          , k = k >>> 8 ^ k & 255 ^ 99;
        l[e] = k;
        s[k] = e;
        var z = a[e]
          , F = a[z]
          , G = a[F]
          , y = 257 * a[k] ^ 16843008 * k;
        t[e] = y << 24 | y >>> 8;
        r[e] = y << 16 | y >>> 16;
        w[e] = y << 8 | y >>> 24;
        v[e] = y;
        y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;
        b[k] = y << 24 | y >>> 8;
        x[k] = y << 16 | y >>> 16;
        q[k] = y << 8 | y >>> 24;
        n[k] = y;
        e ? (e = z ^ a[a[a[G ^ z]]],
        j ^= a[a[j]]) : e = j = 1
    }
    var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]
      , d = d.AES = p.extend({
        _doReset: function() {
            for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++)
                if (j < d)
                    e[j] = c[j];
                else {
                    var k = e[j - 1];
                    j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24,
                    k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255],
                    k ^= H[j / d | 0] << 24);
                    e[j] = e[j - d] ^ k
                }
            c = this._invKeySchedule = [];
            for (d = 0; d < a; d++)
                j = a - d,
                k = d % 4 ? e[j] : e[j - 4],
                c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]]
        },
        encryptBlock: function(a, b) {
            this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l)
        },
        decryptBlock: function(a, c) {
            var d = a[c + 1];
            a[c + 1] = a[c + 3];
            a[c + 3] = d;
            this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);
            d = a[c + 1];
            a[c + 1] = a[c + 3];
            a[c + 3] = d
        },
        _doCryptBlock: function(a, b, c, d, e, j, l, f) {
            for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++)
                var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++]
                  , s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++]
                  , t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++]
                  , n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++]
                  , g = q
                  , h = s
                  , k = t;
            q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];
            s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];
            t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];
            n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];
            a[b] = q;
            a[b + 1] = s;
            a[b + 2] = t;
            a[b + 3] = n
        },
        keySize: 8
    });
    u.AES = p._createHelper(d)
}
)();

var com = {};
com.str = {
    _KEY: "12345678900000001234567890000000",//32λ
    _IV: "abcd134556abcedf",//16λ
    Encrypt: function (str) {
        var key = CryptoJS.enc.Utf8.parse(this._KEY);
        var iv = CryptoJS.enc.Utf8.parse(this._IV);

        var encrypted = '';

        var srcs = CryptoJS.enc.Utf8.parse(str);
        encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.ciphertext.toString();
    },

    Decrypt: function (str) {
        var result =  com.str.DecryptInner(str);
         try {
            var newstr =  com.str.DecryptInner(result);
            if(newstr!=""){
                result = newstr;
            }
          } catch (ex) {
            var msg = ex;
        }
        return result;
    },
     DecryptInner: function (str) {
        var key = CryptoJS.enc.Utf8.parse(this._KEY);
        var iv = CryptoJS.enc.Utf8.parse(this._IV);
        var encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var decrypt = CryptoJS.AES.decrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        var result =  decryptedStr.toString();
         try {
            result =  Decrypt(result);
          } catch (ex) {
            var msg = ex;
        }
        return result;
    }
}


function iemap(myarray ,callback, thisArg) {

    var T, A, k;

    if (myarray == null) {
        throw new TypeError(" this is null or not defined");
    }
    var O = Object(myarray);

    var len = O.length >>> 0;
    if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
        T = thisArg;
    }

    A = new Array(len);
    k = 0;
    while(k < len) {
        var kValue, mappedValue;
        if (k in O) {
            kValue = O[ k ];
            mappedValue = callback.call(T, kValue, k, O);

            A[ k ] = mappedValue;
        }
        k++;
    }
    return A;
};
function GetJs(RunEval){
    return unzip(RunEval);
}
function EvalKey(js1, js2){
    eval(js1);
    return eval(js2);
}
function UpdateKey(key){
    com.str._KEY = key;
}
function DecryptDocID(key, id){
    if(key){
        UpdateKey(key);
    }
    var unzipid = unzip(id);
    var realid = com.str.Decrypt(unzipid);
    return realid;
}