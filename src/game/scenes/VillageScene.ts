import Phaser from 'phaser';
import type { EraId, LocationId } from '../../shared/types/content';
import type { InteractionTarget } from '../../shared/events/GameEvents';
import type { GameSession } from '../../services/GameSession';

interface TargetPoint {
  x: number;
  y: number;
  target: InteractionTarget;
  visual?: Phaser.GameObjects.GameObject & { setVisible(value: boolean): unknown };
}

export class VillageScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private vector = new Phaser.Math.Vector2();
  private touchVector = new Phaser.Math.Vector2();
  private pausedByUi = false;
  private nearest: TargetPoint | null = null;
  private targetPoints: TargetPoint[] = [];
  private eraLayer!: Phaser.GameObjects.Container;
  private locationVisuals = new Map<LocationId, Phaser.GameObjects.Container>();
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private unsubscribe: Array<() => void> = [];
  private lastPositionSave = 0;
  private renderedEra: EraId | null = null;

  constructor(private readonly session: GameSession) {
    super('village');
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 1200, 800);
    this.cameras.main.setBounds(0, 0, 1200, 800);
    this.createTextures();
    this.eraLayer = this.add.container(0, 0).setDepth(-10);
    this.drawEnvironment();
    this.createObstacles();
    this.createTargets();

    const state = this.session.snapshot();
    this.player = this.physics.add.sprite(state.player.x, state.player.y, 'player-idle');
    this.player.setCircle(15, 3, 10).setCollideWorldBounds(true).setDepth(20);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.05);

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Không thể khởi tạo bàn phím.');
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
    keyboard.on('keydown-E', () => this.interact());
    keyboard.on('keydown-SPACE', () => this.interact());
    keyboard.on('keydown-T', () => this.session.switchEra());

    this.unsubscribe.push(
      this.session.events.onCommand((command) => {
        if (command.type === 'move') this.touchVector.set(command.x, command.y);
        if (command.type === 'interact') this.interact();
        if (command.type === 'pause') this.pausedByUi = command.paused;
        if (command.type === 'switch-era') this.session.switchEra();
        if (command.type === 'reset-position') this.player.setPosition(150, 400);
      }),
      this.session.events.on('state', () => {
        this.drawEnvironment();
        this.updateTargetAvailability();
      }),
    );
    this.updateTargetAvailability();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe.splice(0).forEach((off) => off()));
  }

  update(time: number): void {
    const speed = 180;
    this.vector.set(0, 0);
    if (!this.pausedByUi) {
      if (this.cursors.left.isDown || this.wasd.left.isDown) this.vector.x -= 1;
      if (this.cursors.right.isDown || this.wasd.right.isDown) this.vector.x += 1;
      if (this.cursors.up.isDown || this.wasd.up.isDown) this.vector.y -= 1;
      if (this.cursors.down.isDown || this.wasd.down.isDown) this.vector.y += 1;
      if (this.vector.lengthSq() === 0) this.vector.copy(this.touchVector);
    }
    if (this.vector.lengthSq() > 0) this.vector.normalize().scale(speed);
    this.player.setVelocity(this.vector.x, this.vector.y);
    this.player.setTexture(this.vector.lengthSq() > 0 ? 'player-walk' : 'player-idle');
    if (this.vector.x !== 0) this.player.setFlipX(this.vector.x < 0);
    this.updateNearestTarget();
    this.session.updatePlayer(this.player.x, this.player.y);
    if (time - this.lastPositionSave > 1500) {
      this.session.flushPlayerPosition();
      this.lastPositionSave = time;
    }
  }

  private createTextures(): void {
    if (this.textures.exists('player-idle')) return;
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x173b33).fillCircle(18, 20, 14);
    graphics.fillStyle(0xf2c879).fillCircle(18, 12, 8);
    graphics.fillStyle(0xf7f0d5).fillRoundedRect(7, 23, 22, 19, 7);
    graphics.generateTexture('player-idle', 36, 44);
    graphics.clear();
    graphics.fillStyle(0x173b33).fillCircle(18, 19, 14);
    graphics.fillStyle(0xf2c879).fillCircle(18, 11, 8);
    graphics.fillStyle(0xe9b44c).fillRoundedRect(7, 22, 22, 19, 7);
    graphics.generateTexture('player-walk', 36, 44);
    graphics.destroy();
  }

  private drawEnvironment(): void {
    if (!this.eraLayer) return;
    const activeEra = this.session.snapshot().activeEra;
    if (this.renderedEra === activeEra) return;
    this.renderedEra = activeEra;
    this.eraLayer.removeAll(true);
    const oldEra = activeEra === 'ly_1077';
    const ground = this.add.rectangle(600, 400, 1200, 800, oldEra ? 0xb8a86f : 0xbdd49b);
    const river = this.add.rectangle(600, 710, 1200, 180, oldEra ? 0x6f8f8d : 0x7db8bb);
    const pathColor = oldEra ? 0xc9b27b : 0xdacaa5;
    const pathA = this.add.rectangle(600, 400, 1060, 105, pathColor);
    const pathB = this.add.rectangle(610, 405, 105, 560, pathColor);
    const fields = [
      this.add.rectangle(170, 145, 220, 165, oldEra ? 0x8f9e63 : 0x91bd73),
      this.add.rectangle(1000, 145, 250, 165, oldEra ? 0x9b8e59 : 0x86b76d),
    ];
    this.eraLayer.add([ground, river, pathA, pathB, ...fields]);
  }

  private createObstacles(): void {
    this.obstacles = this.physics.add.staticGroup();
    const building = this.add.rectangle(300, 155, 170, 115, 0x8b4d36).setStrokeStyle(8, 0xe6c07a).setDepth(2);
    this.add.text(300, 155, 'NHÀ MINH HỌA', { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '15px', color: '#fff7e5', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
    const pond = this.add.ellipse(945, 590, 190, 105, 0x5e9fa1).setStrokeStyle(5, 0x316d72).setDepth(1);
    this.obstacles.add(building);
    this.obstacles.add(pond);
    [
      [85, 575], [110, 610], [1070, 300], [1100, 335], [900, 95],
    ].forEach(([x, y]) => {
      const tree = this.add.circle(x, y, 28, 0x2f7049).setStrokeStyle(6, 0x1d4e35).setDepth(4);
      this.obstacles.add(tree);
    });
  }

  private createTargets(): void {
    const guideVisual = this.createMarker(250, 400, 0xe6b34a, 'NGƯỜI DẪN\nCHUYỆN');
    this.targetPoints.push({ x: 250, y: 400, target: { type: 'guide' }, visual: guideVisual });

    this.session.locations.all().forEach((location) => {
      const visual = this.createMarker(location.world.x, location.world.y, 0x8f3f4f, location.name.toUpperCase());
      this.locationVisuals.set(location.id, visual);
      this.targetPoints.push({ x: location.world.x, y: location.world.y, target: { type: 'location', location }, visual });
    });

    const portal = this.add.container(1020, 400).setDepth(6);
    const outer = this.add.circle(0, 0, 48, 0x39516f, 0.45).setStrokeStyle(7, 0xe6b34a);
    const inner = this.add.circle(0, 0, 27, 0x7d4e8f, 0.7);
    const label = this.add.text(0, 63, 'CỔNG THỜI GIAN', { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '14px', color: '#173b33', backgroundColor: '#fff7e5', padding: { x: 7, y: 4 }, fontStyle: 'bold' }).setOrigin(0.5);
    portal.add([outer, inner, label]);
    this.tweens.add({ targets: inner, scale: 1.2, alpha: 0.35, duration: 1000, yoyo: true, repeat: -1 });
    this.targetPoints.push({ x: 1020, y: 400, target: { type: 'portal', unlocked: false }, visual: portal });
  }

  private createMarker(x: number, y: number, color: number, labelText: string): Phaser.GameObjects.Container {
    const marker = this.add.container(x, y).setDepth(5);
    const halo = this.add.circle(0, 0, 29, 0xffffff, 0.65).setStrokeStyle(3, color);
    const pin = this.add.circle(0, 0, 17, color);
    const label = this.add.text(0, 41, labelText, {
      align: 'center', fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '13px', color: '#173b33', backgroundColor: '#fff7e5', padding: { x: 6, y: 3 }, fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    marker.add([halo, pin, label]);
    return marker;
  }

  private updateTargetAvailability(): void {
    const state = this.session.snapshot();
    this.locationVisuals.forEach((visual) => visual.setVisible(state.activeEra === 'present'));
    this.targetPoints.forEach((point) => {
      if (point.target.type === 'portal') point.target = { type: 'portal', unlocked: this.session.portalUnlocked() };
    });
  }

  private updateNearestTarget(): void {
    let best: TargetPoint | null = null;
    let bestDistance = 85;
    for (const point of this.targetPoints) {
      if (point.target.type === 'location' && this.session.snapshot().activeEra !== 'present') continue;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y);
      if (distance < bestDistance) { best = point; bestDistance = distance; }
    }
    if (this.nearest === best) return;
    this.nearest = best;
    const prompt = best ? (best.target.type === 'location' ? 'Khám phá' : best.target.type === 'guide' ? 'Trò chuyện' : best.target.unlocked ? 'Du hành thời gian' : 'Cổng chưa mở') : null;
    this.session.events.emit('prompt', prompt);
  }

  private interact(): void {
    if (this.pausedByUi || !this.nearest) return;
    const target = this.nearest.target;
    if (target.type === 'portal') {
      if (!target.unlocked) {
        this.session.events.emit('notice', 'Hãy trò chuyện và khám phá đủ ba địa điểm trước.');
        return;
      }
      this.session.usePortal();
      this.session.events.emit('notice', 'Bạn đã bước qua cổng thời gian. Đây là không gian tái hiện minh họa.');
      return;
    }
    this.session.events.emit('interaction', target);
  }
}
