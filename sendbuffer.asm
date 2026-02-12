; WS2812B LED buffer send routine for ARM Thumb
; Optimized timing for micro:bit

    .syntax unified
    .cpu cortex-m0
    .thumb

; Export symbols
    .global ws2812b_send_buffer

; Parameters:
;   r0 = GPIO base address
;   r1 = buffer address  
;   r2 = buffer length
;   r3 = pin mask

ws2812b_send_buffer:
    push {r4-r7, lr}
    
send_loop:
    ldrb r4, [r1], #1           ; Load byte, increment pointer
    movs r5, #8                 ; Bit counter
    
bit_loop:
    lsls r4, r4, #1             ; Shift left, MSB to carry
    bcs send_one                ; Branch if bit is 1
    
send_zero:
    str r3, [r0, #0x508]        ; Set pin HIGH
    nop
    nop
    str r3, [r0, #0x50C]        ; Set pin LOW
    subs r5, #1
    bne bit_loop
    subs r2, #1
    bne send_loop
    b done
    
send_one:
    str r3, [r0, #0x508]        ; Set pin HIGH
    nop
    nop
    nop
    nop
    nop
    str r3, [r0, #0x50C]        ; Set pin LOW
    subs r5, #1
    bne bit_loop
    subs r2, #1
    bne send_loop

done:
    pop {r4-r7, pc}
    
    .end
