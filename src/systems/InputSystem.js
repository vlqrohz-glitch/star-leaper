/**
 * Input System - Maps keyboard inputs (Arrows, WASD, Space) to game actions.
 */
export class InputSystem {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      equip: Phaser.Input.Keyboard.KeyCodes.Q,
      use: Phaser.Input.Keyboard.KeyCodes.E,
      attack: Phaser.Input.Keyboard.KeyCodes.F
    });

    // Virtual Touch State for Mobile Devices
    this.touchState = {
      left: false,
      right: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      jumpJustReleased: false,
      equip: false,
      equipJustPressed: false,
      attack: false,
      attackJustPressed: false
    };

    // Expose global bridge for DOM touch controls
    window.__STARLEAPER_TOUCH__ = this.touchState;
  }

  isLeft() {
    return this.cursors.left.isDown || this.wasd.left.isDown || this.touchState.left;
  }

  isRight() {
    return this.cursors.right.isDown || this.wasd.right.isDown || this.touchState.right;
  }

  isDown() {
    return this.cursors.down.isDown || this.wasd.down.isDown || this.touchState.down;
  }

  isJump() {
    return this.cursors.up.isDown || this.wasd.up.isDown || this.wasd.space.isDown || this.touchState.jump;
  }

  isJumpJustPressed() {
    const justPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                        Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                        Phaser.Input.Keyboard.JustDown(this.wasd.space) ||
                        this.touchState.jumpJustPressed;
    if (this.touchState.jumpJustPressed) {
      this.touchState.jumpJustPressed = false;
    }
    return justPressed;
  }

  isJumpJustReleased() {
    const justReleased = Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
                         Phaser.Input.Keyboard.JustUp(this.wasd.up) ||
                         Phaser.Input.Keyboard.JustUp(this.wasd.space) ||
                         this.touchState.jumpJustReleased;
    if (this.touchState.jumpJustReleased) {
      this.touchState.jumpJustReleased = false;
    }
    return justReleased;
  }

  isAttack() {
    return (this.wasd.use && this.wasd.use.isDown) ||
           (this.wasd.attack && this.wasd.attack.isDown) ||
           this.touchState.attack;
  }

  isAttackJustPressed() {
    const justPressed = (this.wasd.use && Phaser.Input.Keyboard.JustDown(this.wasd.use)) ||
                        (this.wasd.attack && Phaser.Input.Keyboard.JustDown(this.wasd.attack)) ||
                        this.touchState.attackJustPressed;
    if (this.touchState.attackJustPressed) {
      this.touchState.attackJustPressed = false;
    }
    return justPressed;
  }

  isUseJustPressed() {
    return (this.wasd.use && Phaser.Input.Keyboard.JustDown(this.wasd.use));
  }

  isEquipJustPressed() {
    const justPressed = (this.wasd.equip && Phaser.Input.Keyboard.JustDown(this.wasd.equip)) ||
                        this.touchState.equipJustPressed;
    if (this.touchState.equipJustPressed) {
      this.touchState.equipJustPressed = false;
    }
    return justPressed;
  }
}
