var chai = require('chai'),
    julia = require('..'),
    expect = chai.expect;

function verifyIdentityMatrix(X,expectedLength)
{
   var len = X.length;
   var passed = X.length == expectedLength;

   if(!passed) return false;

   for(var i = 0;i < X.length;i++)
   {
      if(X[i].length != X.length)
      {
         passed = false;
         break;
      }

      for(j = 0;j < len;j++)
      {
         if(i == j && X[i][j] != 1)
         {
            passed = false;
            break;
         }
         if(i != j && X[i][j] != 0)
         {
            passd = false;
            break;
         }
      }
   }

   return passed;
}

describe('Regression Tests',function()
{
   it('eval Null return',function()
   {
      expect(julia.eval('()')).to.equal(null);
   });

   it('eval Boolean return',function()
   {
      expect(julia.eval('true')).to.equal(true);
   });

   it('eval Integer return',function()
   {
      expect(julia.eval('0')).to.equal(0);
   });

   it('version',function()
   {
      expect(julia.eval('VERSION.minor')).to.within(3,4);
   });

   it('eval max 32 bit Integer (4294967296)',function()
   {
      expect(julia.eval('4294967296')).to.equal(4294967296);
   });

   it('eval max JavaScript Integer (9007199254740992)',function()
   {
      expect(julia.eval('9007199254740992')).to.equal(9007199254740992);
   });

   it('eval primitive Float return',function()
   {
      expect(julia.eval('1.0')).to.equal(1.0);
   });

   it('eval max JavaScript Float (' + Number.MAX_VALUE + ')',function()
   {
      expect(julia.eval('' + Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
   });

   it('simple result return style for Eval',function()
   {
      expect(julia.eval('"x"')).to.equal('x');
   });

   it('tuple result return style for Eval',function()
   {
      expect(julia.eval('("x","y")')).to.eql(['x','y']);
   });

   it('exec identity Null',function(done)
   {
      julia.exec('identity',null,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(null);
         done();
      });
   });

   it('exec identity Boolean',function(done)
   {
      julia.exec('identity',true,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(true);
         done();
      });
   });

   it('exec identity Integer',function(done)
   {
      julia.exec('identity',1,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(1);
         done();
      });
   });

   it('exec identity Float',function(done)
   {
      julia.exec('identity',0.1,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(0.1);
         done();
      });
   });

   it('exec identity String',function(done)
   {
      julia.exec('identity','x',function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('x');
         done();
      });
   });

   it('simple result return style for Exec',function()
   {
      expect(julia.exec('identity','x')).to.equal('x');
   });

   it('implicit conversion from SubString to String',function()
   {
      expect(julia.eval('match(r"(a)","a").match')).to.equal('a');
   });

   it('eval include',function()
   {
      // Keep Core.include for the time being.  This should be unnecessary, but
      // currently is.  Once the libuv problems are resolved, Core.include
      // can be shortened to simply include.
      expect(julia.eval('Core.include("test/inc1.jl")')).to.equal(true);
   });

   it('exec include',function(done)
   {
      julia.exec('include','test/inc2.jl',function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(true);
         done();
      });
   });

   it('user defined functions via exec',function()
   {
      var res1 = julia.exec('f',100);
      var res2 = julia.exec('g',100);

      expect(res1).to.equal(res2);
   });

   it('macros via eval',function()
   {
      expect(julia.eval('@sprintf("x")')).to.equal('x');
   });

   it('arrays via eval',function()
   {
      expect(verifyIdentityMatrix(julia.eval('eye(1000)'),1000)).to.equal(true);
   });

   it('arrays via exec',function(done)
   {
      julia.exec('eye',1000,function(err,res)
      {
         expect(err).to.equal(null);
         expect(verifyIdentityMatrix(res,1000)).to.equal(true);
         done();
      });
   });

   it('construction of Script using new',function()
   {
      var script = new julia.Script("test/inc1.jl");

      expect(script.getPath()).to.equal('test/inc1.jl');
   });

   it('construction of Script using function call like syntax',function()
   {
      var script = julia.Script("test/inc2.jl");

      expect(script.getModuleName()).to.equal('njIsoMod1');
   });

   it('script creation (via factory)',function()
   {
      var script = julia.newScript("test/inc3.jl");

      expect(verifyIdentityMatrix(script.exec(10),10)).to.equal(true);
   });

   it('script exec using return style',function()
   {
      var script = julia.newScript("test/inc3.jl");

      expect(script.exec(5,3)).to.eql(julia.exec('eye',5,3));
   });

   it('loading array type tests',function(done)
   {
      julia.exec('include','test/inc4.jl',function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(true);
         done();
      });
   });

   it('typecheck Null array elements (synchronously)',function()
   {
      expect(julia.exec('typecheckArray',[null])).to.equal('void');
   });

   it('typecheck Null array elements (asynchronously)',function(done)
   {
      julia.exec('typecheckArray',[null],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('void');
         done();
      });
   });

   it('typecheck Boolean array elements (synchronously)',function()
   {
      expect(julia.exec('typecheckArray',[true,false,true])).to.equal('boolean');
   })

   it('typecheck Boolean array elements (asynchronously)',function(done)
   {
      julia.exec('typecheckArray',[true,false,true],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('boolean');
         done();
      });
   });

   it('typecheck Integer array elements (synchronously)',function()
   {
      expect(julia.exec('typecheckArray',[1.0,1234,-9000])).to.equal('int');
   })

   it('typecheck Integer array elements (asynchronously)',function(done)
   {
      julia.exec('typecheckArray',[1.0],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('int');
         done();
      });
   });

   it('typecheck Float array elements (synchronously)',function()
   {
      expect(julia.exec('typecheckArray',[1.1,6e26,0.000001])).to.equal('float');
   })

   it('typecheck Float array elements (asynchronously)',function(done)
   {
      julia.exec('typecheckArray',[1.1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('float');
         done();
      });
   });

   it('typecheck String array elements (synchronously)',function()
   {
      expect(julia.exec('typecheckArray',["abcd","000000",""])).to.equal('string');
   })

   it('typecheck String array elements (asynchronously)',function(done)
   {
      julia.exec('typecheckArray',[""],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('string');
         done();
      });
   });

   it('typecheck [Boolean,Integer] -> [Integer]',function(done)
   {
      julia.exec('typecheckArray',[true,1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('int');
         done();
      });
   });

   it('typecheck [Boolean,Float] -> [Float]',function(done)
   {
      julia.exec('typecheckArray',[true,1.1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('float');
         done();
      });
   });

   it('typecheck [Boolean,String] -> [String]',function(done)
   {
      julia.exec('typecheckArray',[true,""],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('string');
         done();
      });
   });

   it('typecheck [Integer,Float] -> [Float]',function(done)
   {
      julia.exec('typecheckArray',[1,1.1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('float');
         done();
      });
   });

   it('typecheck [Float,Integer] -> [Float]',function(done)
   {
      julia.exec('typecheckArray',[1.1,1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('float');
         done();
      });
   });

   it('prevent widening String elements',function(done)
   {
      julia.exec('typecheckArray',[true,"x",1,1.1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('none');
         done();
      });
   });

   it('prevent widening Null elements',function(done)
   {
      julia.exec('typecheckArray',[true,null,1,1.1],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('none');
         done();
      });
   });

   it('simple Integer array input',function(done)
   {
      julia.exec('sum',[1,2,3],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(6);
         done();
      });
   });

   it('simple Float array input',function(done)
   {
      julia.exec('sum',[1.5,2.6,3.7],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(7.8);
         done();
      });
   });

   it('simple String array input',function(done)
   {
      julia.exec('concat',['a','b','c'],function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal('abc');
         done();
      });
   });

   it('array of null',function()
   {
      expect(julia.eval('Array(Void,2,2)')).to.eql([[null,null],[null,null]]);
   });

   it('array of elementwise conversion from SubString to String',function()
   {
      expect(julia.exec('split','a b c',' ')).to.eql(['a','b','c']);
   });

   it('native Int8Array to Array{Int8,1}',function()
   {
      var a = new Int8Array(256);

      for(var i = 0;i < 256;i++) a[i] = i - 128;

      expect(julia.exec('sum',a)).to.equal(-128);
   });

   it('native Uint8Array to Array{Uint8,1}',function()
   {
      var a = new Uint8Array(256);

      for(var i = 0;i < 256;i++) a[i] = i;

      expect(julia.exec('sum',a)).to.equal(32640);
   });

   it('native Int16Array to Array{Int16,1}',function()
   {
      var a = new Int16Array(65536);

      for(var i = 0;i < 65536;i++) a[i] = i - 32768;

      expect(julia.exec('sum',a)).to.equal(-32768);
   });

   it('native Uint16Array to Array{Uint16,1}',function()
   {
      var a = new Uint16Array(65536);

      for(var i = 0;i < 65536;i++) a[i] = i;

      expect(julia.exec('sum',a)).to.equal(2147450880);
   });

   it('native Int32Array to Array{Int32,1}',function()
   {
      var a = new Int32Array(100000);

      for(var i = 0;i < 100000;i++)
      {
         if(i % 2 == 0) a[i] = i - 2147483648;
         else a[i] = 2147483647 - i;
      }

      expect(julia.exec('sum',a)).to.equal(-100000);
   });

   it('native Uint32Array to Array{Uint32,1}',function()
   {
      var a = new Uint32Array(100000);

      for(var i = 0;i < 100000;i++) a[i] = 4294967295 - i;

      expect(julia.exec('sum',a)).to.equal(429491729550000);
   });

   it('native Float32Array to Array{Float32,1}',function()
   {
      var a = new Float32Array(10000);

      for(var i = 0;i < 10000;i++) a[i] = 123.45678;

      expect(Math.abs(julia.exec('sum',a) - 1.2345678E6)).to.be.below(50);
   });

   it('native Float64Array to Array{Float64,1}',function()
   {
      var a = new Float64Array(10000);

      for(var i = 0;i < 10000;i++) a[i] = 1.2345678E39

      expect(Math.abs(julia.exec('sum',a) - 1.2345678E43)).to.be.below(1E30);
   });

   it('buffer to Array{Uint8,1} and back as Buffer',function()
   {
      var b = new Buffer(400000);

      for(var i = 0;i < 400000;i++) b[i] = i % 256;
      expect(julia.exec('identity',b)).to.eql(b);
   });

   it('buffer to Array{Uint8,1} and back as reshaped Array',function()
   {
      var b = new Buffer(6);
      var a1 = new Uint8Array([0,2,4]);
      var a2 = new Uint8Array([1,3,5]);

      for(var i = 0;i < b.length;i++) b[i] = i;

      var res = julia.exec('reshape',b,2,3);

      expect(res).to.eql([a1,a2]);
   });

   it('multidimensional Array',function()
   {
      var a = [ [[1,2],[3,4]], [[5,6],[7,8]], [[9,10],[11,12]] ];
      var a1 = new Float64Array([1,2]);
      var a2 = new Float64Array([3,4]);
      var a3 = new Float64Array([5,6]);
      var a4 = new Float64Array([7,8]);
      var a5 = new Float64Array([9,10]);
      var a6 = new Float64Array([11,12]);

      expect(julia.exec('identity',a)).to.eql([[a1,a2],[a3,a4],[a5,a6]]);
   });

   it('buffer to Multidimensional Array',function()
   {
      var b = new Buffer(16);
      var a1 = new Uint8Array([0,8]);
      var a2 = new Uint8Array([4,12]);
      var a3 = new Uint8Array([2,10]);
      var a4 = new Uint8Array([6,14]);
      var a5 = new Uint8Array([1,9]);
      var a6 = new Uint8Array([5,13]);
      var a7 = new Uint8Array([3,11]);
      var a8 = new Uint8Array([7,15]);

      for(var i = 0;i < b.length;i++) b[i] = i;

      expect(julia.exec('reshape',b,2,2,2,2)).to.eql([[[a1,a2],[a3,a4]],[[a5,a6],[a7,a8]]]);
   });

   it('simplistic Regex',function()
   {
      var re = /a/;

      expect(julia.exec('identity',re)).to.eql(re);
   });

   /***
    *
    * Kind of a workaround here
    *
    */
   it('date (Julia version 0.4+ only)',function()
   {
      var now = new Date();
      var version = julia.eval('VERSION.minor');

      if(version == 4) expect(julia.exec('identity',now)).to.eql(now);
   });

   it('array of Date (Julia version 0.4+ only)',function()
   {
      var now = new Date();
      var nowMinus20 = new Date(now - 20);
      var version = julia.eval('VERSION.minor');
      var a = [ now, nowMinus20 ];

      if(version == 4) expect(julia.exec('identity',a)).to.eql([now,nowMinus20]);
   });

   it('array of Regex',function()
   {
      var reArray = [ /a/, /b/, /c/ ];

      expect(julia.exec('identity',reArray)).to.eql(reArray);
   });

   it('JRef from eval',function()
   {
      julia.exec('include','test/inc5.jl');

      var juliaObj = julia.eval('T1(5,[3,4,5,6,7,8])');

      expect(julia.exec('t1Mult',juliaObj)).to.eql(new Float64Array([15,20,25,30,35,40]));
   });

   it('JRef from exec',function()
   {
      var juliaObj = julia.exec('t1Cons',5,[1,2,3]);

      expect(julia.exec('t1Mult',juliaObj)).to.eql(new Float64Array([5,10,15]));
   });

   it('JRef random creation and deletion',function()
   {
      var a = [];
      var i;

      for(i = 0;i < 400;i++) a[julia.eval('rand(1:999)')] = julia.exec('t1Cons',julia.eval('rand(0:1000000)'),julia.exec('rand',5));
   });

   it('2D Array Request with Native Arrays ',function()
   {
      var a = julia.exec('rand',10,10);

      expect(julia.exec('identity',a)).to.eql(a);
   });

   it('multidimensional Array Request with Native Arrays ',function()
   {
      var a = julia.exec('rand',3,2,7,5,6,4);

      expect(julia.exec('identity',a)).to.eql(a);
   });

   it('manually creating arrays of NativeArray for linear algebra',function()
   {
      var e1 = new Float64Array(2);
      var e2 = new Float64Array(2);
      var a = [e1,e2];

      e1[0] = e2[1] = 1;
      e1[1] = e2[0] = 2;

      var aInv = julia.exec('inv',a);
      var b = julia.exec('*',a,aInv);
      var eye = julia.exec('eye',2);

      expect(b).to.eql(eye);
   });

   it('ill-defined matrix via exception',function()
   {
      var error;

      try
      {
         julia.exec('transpose',[[ 1, 2, 3 ], [ 4, 5 ]]);
      }
      catch(e)
      {
         error = e;
      }
      expect(error.message).to.equal('Malformed input array');
   });

   it('ill-defined matrix via err in callback',function(done)
   {
      julia.exec('identity',[[ 1, 2, 3 ], [[ 4, 5 ,6], [2]]],function(err,res)
      {
         expect(err).to.equal('Malformed input array');
         done();
      });
   });
   it('eval syntax error',function()
   {
      var error;

      try
      {
         julia.eval('lkasjdlkajsda');
      }
      catch(e)
      {
         error = e;
      }
      expect(error.message).to.equal('Julia undefined variable lkasjdlkajsda');
   });
   it('function search (not found)',function(done)
   {
      julia.exec('a',function(err,res)
      {
         expect(err).to.equal('Julia method a is undefined');
         done();
      });
   });
   it('function deep search (not found)',function(done)
   {
      julia.exec('a.b',function(err,res)
      {
         expect(err).to.equal('Julia method a.b is undefined');
         done();
      });
   });
   it('function deep[1] search (found)',function(done)
   {
      julia.exec('Base.identity',10,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(10);
         done();
      });
   });
   it('function deep[3] search (found)',function(done)
   {
      var a = new Float64Array(2);
      var b = new Float64Array(2);

      a[0] = 1.0;
      a[1] = 2.0;
      b[0] = 3.0;
      b[1] = 4.0;

      julia.exec('Base.LinAlg.BLAS.dot',a,b,function(err,res)
      {
         expect(err).to.equal(null);
         expect(res).to.equal(11);
         done();
      });
   });
   it('Import (synchronous)',function()
   {
      testMod = julia.import('test/testMod');
      expect(testMod.test(100)).to.equal(5050);
   });
   it('Import (asynchronous)',function(done)
   {
      julia.import('test/testMod',function(err,testMod)
      {
         expect(err).to.equal(null);
         expect(testMod.test(100)).to.equal(5050);
         done();
      });
   });
   it('Import non existant module attempt',function(done)
   {
      var version = julia.eval('VERSION.minor');

      julia.import('x',function(err,testMod)
      {
         if(version == 3) expect(err).to.equal('ArgumentError("x not found in path")');
         else expect(err).to.equal('ArgumentError: x not found in path');
         done();
      });
   });
});
