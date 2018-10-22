(module
 (import "env" "memory" (memory $0 256))
 (import "env" "memoryBase" (global $memoryBase i32))
 (global $STACKTOP (mut i32) (i32.const 0))
 (global $STACK_MAX (mut i32) (i32.const 0))
 (export "__post_instantiate" (func $__post_instantiate))
 (export "_grayscale" (func $_grayscale))
 (func $_grayscale (; 0 ;) (; has Stack IR ;) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (set_local $2
   (i32.mul
    (i32.shl
     (get_local $1)
     (i32.const 2)
    )
    (get_local $2)
   )
  )
  (set_local $1
   (i32.const 0)
  )
  (loop $while-in
   (if
    (i32.lt_s
     (get_local $1)
     (get_local $2)
    )
    (block
     (i32.store8
      (i32.add
       (get_local $0)
       (i32.or
        (get_local $1)
        (i32.const 1)
       )
      )
      (tee_local $3
       (i32.load8_s
        (i32.add
         (get_local $0)
         (get_local $1)
        )
       )
      )
     )
     (i32.store8
      (i32.add
       (get_local $0)
       (i32.or
        (get_local $1)
        (i32.const 2)
       )
      )
      (get_local $3)
     )
     (set_local $1
      (i32.add
       (get_local $1)
       (i32.const 4)
      )
     )
     (br $while-in)
    )
   )
  )
 )
 (func $runPostSets (; 1 ;) (; has Stack IR ;)
  (nop)
 )
 (func $__post_instantiate (; 2 ;) (; has Stack IR ;)
  (set_global $STACKTOP
   (get_global $memoryBase)
  )
  (set_global $STACK_MAX
   (i32.add
    (get_global $STACKTOP)
    (i32.const 5242880)
   )
  )
  (call $runPostSets)
 )
)
