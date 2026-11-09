import Phaser from 'phaser';
import type { EraId, MapFeature } from '../../shared/types/content';
import type { InteractionTarget } from '../../shared/events/GameEvents';
import type { GameSession } from '../../services/GameSession';
import { NavigationService } from '../../services/NavigationService';
import { getEraVisualLayers } from '../../services/MapLayerService';
import { renderVillageArt } from '../rendering/VillageArtRenderer';

interface TargetPoint { x: number; y: number; target: InteractionTarget; visual?: Phaser.GameObjects.Container }

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
  private navigation!: NavigationService;
  private unsubscribe: Array<() => void> = [];
  private lastPositionSave = 0;
  private renderedEra: EraId | null = null;
  private facing: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor(private readonly session: GameSession) { super('village'); }

  create(): void {
    const { width, height } = this.session.content.map.projection.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.createTextures();
    this.navigation = new NavigationService(this.session.content.map);
    this.eraLayer = this.add.container(0, 0).setDepth(-10);
    this.drawEnvironment();
    this.createTargets();

    const state = this.session.snapshot();
    this.player = this.physics.add.sprite(state.player.x, state.player.y, 'player-down-idle');
    this.player.setCircle(15, 3, 10).setCollideWorldBounds(true).setDepth(state.player.y + 12);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(window.matchMedia('(max-width: 780px)').matches ? 0.82 : 1.05);

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Không thể khởi tạo bàn phím.');
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
    keyboard.on('keydown-E', () => this.interact());
    keyboard.on('keydown-SPACE', () => this.interact());
    keyboard.on('keydown-T', () => this.session.switchEra());

    this.unsubscribe.push(
      this.session.events.onCommand((command) => {
        if (command.type === 'move') this.touchVector.set(command.x, command.y);
        if (command.type === 'interact') this.interact();
        if (command.type === 'pause') this.pausedByUi = command.paused;
        if (command.type === 'switch-era') this.session.switchEra();
        if (command.type === 'reset-position') this.player.setPosition(this.session.content.map.interaction.spawn.x, this.session.content.map.interaction.spawn.y);
      }),
      this.session.events.on('state', () => this.drawEnvironment()),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe.splice(0).forEach((off) => off()));
  }

  update(time: number, delta: number): void {
    const speed = 230;
    this.vector.set(0, 0);
    if (!this.pausedByUi) {
      if (this.cursors.left.isDown || this.wasd.left.isDown) this.vector.x--;
      if (this.cursors.right.isDown || this.wasd.right.isDown) this.vector.x++;
      if (this.cursors.up.isDown || this.wasd.up.isDown) this.vector.y--;
      if (this.cursors.down.isDown || this.wasd.down.isDown) this.vector.y++;
      if (this.vector.lengthSq() === 0) this.vector.copy(this.touchVector);
    }
    if (this.vector.lengthSq() > 0) this.vector.normalize().scale(speed);
    if (this.vector.lengthSq() > 0) this.facing = Math.abs(this.vector.x) > Math.abs(this.vector.y) ? (this.vector.x < 0 ? 'left' : 'right') : (this.vector.y < 0 ? 'up' : 'down');
    this.player.setVelocity(0, 0).setDepth(this.player.y + 12);
    if (this.vector.lengthSq() > 0) {
      const animation = `player-${this.facing}-walk`;
      if (this.player.anims.currentAnim?.key !== animation) this.player.play(animation);
    } else {
      this.player.anims.stop();
      this.player.setTexture(`player-${this.facing}-idle`);
    }
    const next = { x: this.player.x + this.vector.x * delta / 1000, y: this.player.y + this.vector.y * delta / 1000 };
    const era = this.session.snapshot().activeEra;
    if (this.vector.lengthSq() > 0 && this.navigation.canMove(this.player, next, era)) this.player.setPosition(next.x, next.y);
    this.updateNearestTarget();
    this.session.updatePlayer(this.player.x, this.player.y);
    if (time - this.lastPositionSave > 1500) { this.session.flushPlayerPosition(); this.lastPositionSave = time; }
  }

  private createTextures(): void {
    if (this.textures.exists('player-down-idle')) return;
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    (['up', 'down', 'left', 'right'] as const).forEach((direction, index) => {
      const accent = [0xe9b44c, 0xf7f0d5, 0x5c8eb5, 0xb56555][index];
      graphics.clear().fillStyle(0x203f36).fillEllipse(18, 19, 26, 29).fillStyle(0xf2c879).fillCircle(18, 11, 8).fillStyle(accent).fillRoundedRect(7, 23, 22, 18, 6).generateTexture(`player-${direction}-idle`, 36, 44);
      ['a', 'b'].forEach((frame, frameIndex) => {
        graphics.clear().fillStyle(0x203f36).fillEllipse(18, 18 + frameIndex, 26, 29).fillStyle(0xf2c879).fillCircle(18, 10 + frameIndex, 8).fillStyle(accent).fillRoundedRect(7, 22 + frameIndex, 22, 18, 6).fillStyle(0x513d31).fillRect(frameIndex ? 4 : 7, 39, 9, 4).fillRect(frameIndex ? 23 : 20, 39, 9, 4).generateTexture(`player-${direction}-walk-${frame}`, 36, 44);
      });
      this.anims.create({ key: `player-${direction}-walk`, frames: [{ key: `player-${direction}-walk-a` }, { key: `player-${direction}-walk-b` }], frameRate: 7, repeat: -1 });
    });
    graphics.destroy();
  }

  private drawEnvironment(): void {
    if (!this.eraLayer) return;
    const era = this.session.snapshot().activeEra;
    if (era === this.renderedEra) return;
    this.renderedEra = era;
    this.eraLayer.removeAll(true);
    const historical = era === 'ly_1077';
    const layers = getEraVisualLayers(this.session.content.map, era);
    const { width, height } = this.session.content.map.projection.world;
    this.eraLayer.add(this.add.rectangle(width / 2, height / 2, width, height, historical ? 0xb8aa78 : 0xb9d49b));
    if (historical) {
      this.drawHistoricalReconstruction(width, height);
      this.drawLines(layers.water, 0x6f8882, 14, undefined, 0.55);
    } else {
      this.drawPolygons(layers.landuse, 0x8fbd72, 0.78);
      this.drawLines(layers.water, 0x65a9b2, 20);
      this.drawLines(layers.roads, 0xdacaa5, 18, 0x9d9178);
      this.drawLines(layers.footpaths, 0xeee1bf, 8);
      this.drawPolygons(layers.buildings, 0x9a624b, 0.95, 0x5e4635);
    }
    renderVillageArt(this, this.eraLayer, this.session.content.map, era);
    const label = this.add.text(95, 95, historical ? 'THỌ ĐỨC · TÁI HIỆN DIỄN GIẢI 1077' : 'THỌ ĐỨC · BẢN ĐỒ HIỆN TẠI', { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '18px', color: historical ? '#493b2c' : '#173b33', fontStyle: 'bold' });
    const note = historical ? this.add.text(95, 124, 'Không hiển thị đường/công trình hiện đại · Thủy hệ chỉ là mốc tham chiếu hiện nay', { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '13px', color: '#584a36', backgroundColor: '#e6d7a8', padding: { x: 8, y: 5 } }) : null;
    this.eraLayer.add(note ? [label, note] : label);
  }

  private drawLines(features: MapFeature[], color: number, width: number, outline?: number, alpha = 1): void {
    const graphics = this.add.graphics().setAlpha(alpha);
    const draw = (stroke: number, lineWidth: number) => {
      graphics.lineStyle(lineWidth, stroke, 1);
      features.forEach(({ points }) => { if (points.length < 2) return; graphics.beginPath().moveTo(points[0].x, points[0].y); points.slice(1).forEach((p) => graphics.lineTo(p.x, p.y)); graphics.strokePath(); });
    };
    if (outline) draw(outline, width + 5);
    draw(color, width);
    this.eraLayer.add(graphics);
  }

  private drawHistoricalReconstruction(width: number, height: number): void {
    const shapes = [
      this.add.ellipse(width * .2, height * .28, 430, 260, 0x8f9564, .45),
      this.add.ellipse(width * .55, height * .64, 680, 390, 0x9c925f, .35),
      this.add.ellipse(width * .78, height * .24, 410, 300, 0x7e8e5b, .38),
    ];
    const texture = this.add.graphics().lineStyle(3, 0x746b48, .28);
    for (let y = 260; y < height; y += 170) texture.lineBetween(100, y, width - 100, y + 45);
    this.eraLayer.add([...shapes, texture]);
  }

  private drawPolygons(features: MapFeature[], color: number, alpha: number, stroke = color): void {
    const graphics = this.add.graphics().fillStyle(color, alpha).lineStyle(2, stroke, 0.8);
    features.forEach(({ points }) => { if (points.length < 3) return; graphics.beginPath().moveTo(points[0].x, points[0].y); points.slice(1).forEach((p) => graphics.lineTo(p.x, p.y)); graphics.closePath().fillPath().strokePath(); });
    this.eraLayer.add(graphics);
  }

  private createTargets(): void {
    const { guide, portal } = this.session.content.map.interaction;
    this.targetPoints.push({ ...guide, target: { type: 'guide' }, visual: this.createGuide(guide.x, guide.y) });
    this.session.locations.all().forEach((location) => this.targetPoints.push({ x: location.world.x, y: location.world.y, target: { type: 'location', location }, visual: this.createMarker(location.world.x, location.world.y, 0x9d4b55, location.id === 'dinh_tho_duc' ? 'ĐIỂM KÝ ỨC\nĐÌNH THỌ ĐỨC' : location.name.toUpperCase()) }));
    const portalVisual = this.createMarker(portal.x, portal.y, 0x644d82, 'CỔNG THỜI GIAN');
    this.targetPoints.push({ ...portal, target: { type: 'portal', unlocked: false }, visual: portalVisual });
  }

  private createGuide(x: number, y: number): Phaser.GameObjects.Container {
    const guide = this.add.container(x, y).setDepth(y + 15);
    guide.add([this.add.ellipse(3, 18, 38, 12, 0x253d31, .2), this.add.rectangle(0, 4, 22, 27, 0x9a5d44), this.add.circle(0, -12, 10, 0xf1bd80), this.add.triangle(0, -27, -14, 5, 14, 5, 0, -12, 0x365c4d), this.add.text(0, 28, 'NGƯỜI DẪN CHUYỆN', { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '11px', color: '#173b33', backgroundColor: '#fff7e5', padding: { x: 5, y: 3 } }).setOrigin(.5)]);
    return guide;
  }

  private createMarker(x: number, y: number, color: number, text: string): Phaser.GameObjects.Container {
    const marker = this.add.container(x, y).setDepth(y + 14);
    marker.add([this.add.circle(0, 0, 28, 0xfff7e5, .82).setStrokeStyle(4, color), this.add.circle(0, 0, 14, color), this.add.text(0, 37, text, { align: 'center', fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: '12px', color: '#173b33', backgroundColor: '#fff7e5', padding: { x: 6, y: 3 }, fontStyle: 'bold' }).setOrigin(.5, 0)]);
    return marker;
  }

  private updateNearestTarget(): void {
    let best: TargetPoint | null = null; let distance = 90;
    for (const point of this.targetPoints) {
      const candidate = Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y);
      if (candidate < distance) { best = point; distance = candidate; }
    }
    this.targetPoints.forEach((point) => { if (point.target.type === 'portal') point.target = { type: 'portal', unlocked: this.session.portalUnlocked() }; });
    if (this.nearest === best) return;
    this.nearest = best;
    this.session.events.emit('prompt', best ? (best.target.type === 'location' ? 'Khám phá' : best.target.type === 'guide' ? 'Trò chuyện' : best.target.unlocked ? 'Du hành thời gian' : 'Cổng chưa mở') : null);
  }

  private interact(): void {
    if (this.pausedByUi || !this.nearest) return;
    const target = this.nearest.target;
    if (target.type !== 'portal') { this.session.events.emit('interaction', target); return; }
    if (!target.unlocked) { this.session.events.emit('notice', 'Hãy trò chuyện và khám phá đủ ba địa điểm trước.'); return; }
    this.session.usePortal();
    this.session.events.emit('notice', 'Bạn đã bước qua cổng thời gian. Lớp 1077 là tái hiện diễn giải trên cùng hệ tọa độ.');
  }
}
