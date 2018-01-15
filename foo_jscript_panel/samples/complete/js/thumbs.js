_.mixin({
	thumbs : function () {
		this.size = function (f) {
			this.nc = f || this.nc;
			this.close_btn.x = panel.w - this.close_btn.w;
			this.offset = 0;
			switch (true) {
			case panel.w < this.properties.px.value || panel.h < this.properties.px.value || this.properties.mode.value == 5: // off
				this.nc = true;
				_.dispose(this.img);
				this.img = null;
				this.w = 0;
				this.h = 0;
				break;
			case this.properties.mode.value == 0: // grid
				this.x = 0;
				this.y = 0;
				this.w = panel.w;
				this.h = panel.h;
				if (!this.nc && this.columns != Math.floor(this.w / this.properties.px.value)) {
					this.nc = true;
				}
				this.rows = Math.ceil(this.h / this.properties.px.value);
				this.columns = Math.floor(this.w / this.properties.px.value);
				this.img_rows = Math.ceil(this.images.length / this.columns);
				if (this.nc && this.images.length) {
					this.nc = false;
					_.dispose(this.img);
					this.img = null;
					this.img = gdi.CreateImage(Math.min(this.columns, this.images.length) * this.properties.px.value, this.img_rows * this.properties.px.value);
					var temp_gr = this.img.GetGraphics();
					var ci = 0;
					for (var row = 0; row < this.img_rows; row++) {
						for (var col = 0; col < this.columns; col++) {
							_.drawImage(temp_gr, this.images[ci], col * this.properties.px.value, row * this.properties.px.value, this.properties.px.value, this.properties.px.value, image.crop_top);
							ci++;
						};
					};
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
			case this.properties.mode.value == 1: // left
			case this.properties.mode.value == 2: // right
				this.x = this.properties.mode.value == 1 ? 0 : panel.w - this.properties.px.value;
				this.y = 0;
				this.w = this.properties.px.value;
				this.h = panel.h;
				this.rows = Math.ceil(this.h / this.properties.px.value);
				if (this.nc && this.images.length) {
					this.nc = false;
					_.dispose(this.img);
					this.img = null;
					this.img = gdi.CreateImage(this.properties.px.value, this.properties.px.value * this.images.length);
					var temp_gr = this.img.GetGraphics();
					_.forEach(this.images, function (item, i) {
						_.drawImage(temp_gr, item, 0, i * this.properties.px.value, this.properties.px.value, this.properties.px.value, image.crop_top);
					}, this);
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
			case this.properties.mode.value == 3: // top
			case this.properties.mode.value == 4: // bottom
				this.x = 0;
				this.y = this.properties.mode.value == 3 ? 0 : panel.h - this.properties.px.value;
				this.w = panel.w;
				this.h = this.properties.px.value;
				this.columns = Math.ceil(this.w / this.properties.px.value);
				if (this.nc && this.images.length) {
					this.nc = false;
					_.dispose(this.img);
					this.img = null;
					this.img = gdi.CreateImage(this.properties.px.value * this.images.length, this.properties.px.value);
					var temp_gr = this.img.GetGraphics();
					_.forEach(this.images, function (item, i) {
						_.drawImage(temp_gr, item, i * this.properties.px.value, 0, this.properties.px.value, this.properties.px.value, image.crop_top);
					}, this);
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
			}
		}
		
		this.paint = function (gr) {
			switch (true) {
			case !this.images.length:
				this.image_xywh = [];
				break;
			case this.properties.mode.value == 5: // off
				if (this.properties.aspect.value == image.centre) {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - 40, this.properties.aspect.value);
				} else {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
				}
				break;
			case !this.img:
				break;
			case this.properties.mode.value == 0: // grid
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, this.offset * this.properties.px.value, this.w, this.h);
				if (this.overlay) {
					_.drawOverlay(gr, this.x, this.y, this.w, this.h);
					this.image_xywh = _.drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - 40, image.centre);
					this.close_btn.paint(gr, _.RGB(230, 230, 230));
				} else {
					this.image_xywh = [];
				}
				break;
			case this.properties.mode.value == 1: // left
				if (this.properties.aspect.value == image.centre) {
					this.image_xywh = _.drawImage(gr, this.images[this.image], this.properties.px.value + 20, 20, panel.w - this.properties.px.value - 40, panel.h - 40, this.properties.aspect.value);
				} else {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
				}
				_.drawOverlay(gr, this.x, this.y, this.w, this.h);
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, this.offset * this.properties.px.value, this.w, this.h);
				break;
			case this.properties.mode.value == 2: // right
				if (this.properties.aspect.value == image.centre) {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 20, 20, panel.w - this.properties.px.value - 40, panel.h - 40, this.properties.aspect.value);
				} else {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
				}
				_.drawOverlay(gr, this.x, this.y, this.w, this.h);
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, this.offset * this.properties.px.value, this.w, this.h);
				break;
			case this.properties.mode.value == 3: // top
				if (this.properties.aspect.value == image.centre) {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 20, this.properties.px.value + 20, panel.w - 40, panel.h - this.properties.px.value - 40, this.properties.aspect.value);
				} else {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
				}
				_.drawOverlay(gr, this.x, this.y, this.w, this.h);
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, this.offset * this.properties.px.value, 0, this.w, this.h);
				break;
			case this.properties.mode.value == 4: // bottom
				if (this.properties.aspect.value == image.centre) {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - this.properties.px.value - 40, this.properties.aspect.value);
				} else {
					this.image_xywh = _.drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
				}
				_.drawOverlay(gr, this.x, this.y, this.w, this.h);
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, this.offset * this.properties.px.value, 0, this.w, this.h);
				break;
			}
		}
		
		this.metadb_changed = function () {
			if (panel.metadb) {
				if (this.properties.source.value == 0) { // custom folder
					var temp_folder = this.properties.tf.value.replace('%profile%', fb.ProfilePath);
					temp_folder = temp_folder.indexOf(fb.ProfilePath) == 0 ? fb.ProfilePath + panel.tf(temp_folder.substring(fb.ProfilePath.length, temp_folder.length)) : panel.tf(temp_folder);
					if (this.folder == temp_folder) {
						return;
					}
					this.folder = temp_folder;
				} else { // last.fm
					var temp_artist = panel.tf(DEFAULT_ARTIST);
					if (this.artist == temp_artist) {
						return;
					}
					this.artist = temp_artist;
					this.folder = _.artistFolder(this.artist);
				}
			} else {
				this.artist = '';
				this.folder = '';
			}
			this.update();
		}
		
		this.trace = function (x, y) {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		}
		
		this.image_xywh_trace = function (x, y) {
			switch (true) {
			case !this.images.length:
			case this.properties.mode.value == 0 && !this.overlay: // grid
			case this.properties.mode.value != 0 && this.trace(x, y): // not grid
				return false;
			default:
				return x > this.image_xywh[0] && x < this.image_xywh[0] + this.image_xywh[2] && y > this.image_xywh[1] && y < this.image_xywh[1] + this.image_xywh[3];
			}
		}
		
		this.wheel = function (s) {
			var offset = this.offset - s;
			switch (true) {
			case !this.trace(this.mx, this.my):
			case this.properties.mode.value == 0 && this.overlay: // grid
				if (this.images.length < 2) {
					return;
				}
				this.image -= s;
				if (this.image < 0) {
					this.image = this.images.length - 1;
				}
				if (this.image >= this.images.length) {
					this.image = 0;
				}
				window.Repaint();
				return;
			case this.properties.mode.value == 0: // grid
				if (this.img_rows < this.rows) {
					return;
				}
				if (offset < 0) {
					offset = 0;
				}
				if (offset > this.img_rows - this.rows) {
					offset = this.img_rows - this.rows + 1;
				}
				break;
			case this.properties.mode.value == 1: // left
			case this.properties.mode.value == 2: // right
				if (this.images.length < this.rows) {
					return;
				}
				if (offset < 0) {
					offset = 0;
				}
				if (offset + this.rows > this.images.length) {
					offset = this.images.length - this.rows + 1;
				}
				break;
			case this.properties.mode.value == 3: // top
			case this.properties.mode.value == 4: // bottom
				if (this.images.length < this.columns) {
					return;
				}
				if (offset < 0) {
					offset = 0;
				}
				if (offset + this.columns > this.images.length) {
					offset = this.images.length - this.columns + 1;
				}
				break;
			}
			if (this.offset != offset) {
				this.offset = offset;
				window.RepaintRect(this.x, this.y, this.w, this.h);
			}
		}
		
		this.move = function (x, y) {
			this.mx = x;
			this.my = y;
			this.index = this.images.length;
			switch (true) {
			case !this.trace(x, y):
				break;
			case this.properties.mode.value == 0: // grid
				if (this.overlay) {
					return window.SetCursor(this.close_btn.move(x, y) ? IDC_HAND : IDC_ARROW);
				}
				var tmp = Math.floor(x / this.properties.px.value);
				if (tmp < this.columns) {
					this.index = tmp + ((Math.floor(y / this.properties.px.value) + this.offset) * this.columns);
				}
				break;
			case this.properties.mode.value == 1: // left
			case this.properties.mode.value == 2: // right
				this.index = Math.floor(y / this.properties.px.value) + this.offset;
				break;
			case this.properties.mode.value == 3: // top
			case this.properties.mode.value == 4: // bottom
				this.index = Math.floor(x / this.properties.px.value) + this.offset;
				break;
			}
			window.SetCursor(this.index < this.images.length ? IDC_HAND : IDC_ARROW);
		}
		
		this.lbtn_up = function (x, y) {
			switch (true) {
			case !this.trace(x, y):
			case this.properties.mode.value == 0 && this.overlay && this.close_btn.lbtn_up(x, y):
				break;
			case this.properties.mode.value == 0 && !this.overlay && this.index < this.images.length:
				this.image = this.index;
				this.enable_overlay(true);
				break;
			case this.index < this.images.length:
				if (this.image != this.index) {
					this.image = this.index;
					window.Repaint();
				}
				break;
			}
		}
		
		this.lbtn_dblclk = function (x, y) {
			if (this.image_xywh_trace(x, y)) {
				_.run(this.files[this.image]);
			}
		}
		
		this.rbtn_up = function (x, y) {
			panel.m.AppendMenuItem(MF_STRING, 1000, 'Custom folder');
			panel.m.AppendMenuItem(MF_STRING, 1001, 'Last.fm artist art');
			panel.m.CheckMenuRadioItem(1000, 1001, this.properties.source.value + 1000);
			panel.m.AppendMenuSeparator();
			if (this.properties.source.value == 0) { // custom folder
				panel.m.AppendMenuItem(MF_STRING, 1002, 'Refresh');
				panel.m.AppendMenuItem(MF_STRING, 1003, 'Set custom folder...');
			} else { // last.fm
				panel.m.AppendMenuItem(panel.metadb ? MF_STRING : MF_GRAYED, 1004, 'Download now');
				_.forEach(this.limits, function (item) {
					panel.s10.AppendMenuItem(MF_STRING, item + 1010, item);
				});
				panel.s10.CheckMenuRadioItem(_.first(this.limits) + 1010, _.last(this.limits) + 1010, this.properties.limit.value + 1010);
				panel.s10.AppendTo(panel.m, MF_STRING, 'Limit');
			}
			panel.m.AppendMenuSeparator();
			if (!panel.text_objects.length && !panel.list_objects.length) {
				_.forEach(this.modes, function (item, i) {
					panel.s11.AppendMenuItem(MF_STRING, i + 1050, _.capitalize(item));
				});
				panel.s11.CheckMenuRadioItem(1050, 1055, this.properties.mode.value + 1050);
				panel.s11.AppendMenuSeparator();
				var flag = this.properties.mode.value == 5 ? MF_GRAYED : MF_STRING; // off
				_.forEach(this.pxs, function (item) {
					panel.s11.AppendMenuItem(flag, item + 1000, item + 'px');
				});
				panel.s11.CheckMenuRadioItem(_.first(this.pxs) + 1000, _.last(this.pxs) + 1000, this.properties.px.value + 1000);
				panel.s11.AppendTo(panel.m, MF_STRING, 'Thumbs');
				panel.m.AppendMenuSeparator();
			}
			panel.s12.AppendMenuItem(MF_STRING, 1400, 'Off');
			panel.s12.AppendMenuItem(MF_STRING, 1405, '5 seconds');
			panel.s12.AppendMenuItem(MF_STRING, 1410, '10 seconds');
			panel.s12.AppendMenuItem(MF_STRING, 1420, '20 seconds');
			panel.s12.CheckMenuRadioItem(1400, 1420, this.properties.cycle.value + 1400);
			panel.s12.AppendTo(panel.m, MF_STRING, 'Cycle');
			panel.m.AppendMenuSeparator();
			panel.s13.AppendMenuItem(MF_STRING, 1500, 'A-Z');
			panel.s13.AppendMenuItem(MF_STRING, 1501, 'Newest first');
			panel.s13.CheckMenuRadioItem(1500, 1501, this.properties.sort.value + 1500);
			panel.s13.AppendTo(panel.m, MF_STRING, 'Sort');
			panel.m.AppendMenuSeparator();
			if (this.image_xywh_trace(x, y)) {
				if (this.properties.mode.value != 0) {
					panel.m.AppendMenuItem(MF_STRING, 1510, 'Crop (focus on centre)');
					panel.m.AppendMenuItem(MF_STRING, 1511, 'Crop (focus on top)');
					panel.m.AppendMenuItem(MF_STRING, 1512, 'Stretch');
					panel.m.AppendMenuItem(MF_STRING, 1513, 'Centre');
					panel.m.CheckMenuRadioItem(1510, 1513, this.properties.aspect.value + 1510);
					panel.m.AppendMenuSeparator();
				}
				if (this.properties.source.value == 1 && this.images.length > 1) {
					panel.m.AppendMenuItem(this.default_file == this.files[this.image] ? MF_GRAYED : MF_STRING, 1520, 'Set as default');
					panel.m.AppendMenuItem(MF_STRING, 1521, 'Clear default');
					panel.m.AppendMenuSeparator();
				}
				panel.m.AppendMenuItem(MF_STRING, 1530, 'Open image');
				panel.m.AppendMenuItem(MF_STRING, 531, 'Delete image');
				panel.m.AppendMenuSeparator();
			}
			panel.m.AppendMenuItem(_.isFolder(this.folder) ? MF_STRING : MF_GRAYED, 1540, 'Open containing folder');
			panel.m.AppendMenuSeparator();
		}
		
		this.rbtn_up_done = function (idx) {
			switch (idx) {
			case 1000:
			case 1001:
				this.properties.source.set(idx - 1000);
				this.artist = '';
				this.folder = '';
				panel.item_focus_change();
				break;
			case 1002:
				this.update();
				break;
			case 1003:
				this.properties.tf.set(_.input('Enter title formatting or an absolute path to a folder.\n\n%profile% will resolve to your foobar2000 profile folder or the program folder if using portable mode.', window.Name, this.properties.tf.value) || '$directory_path(%path%)');
				this.folder = '';
				panel.item_focus_change();
				break;
			case 1004:
				this.download();
				break;
			case 1011:
			case 1013:
			case 1015:
			case 1020:
			case 1025:
			case 1030:
				this.properties.limit.set(idx - 1010);
				break;
			case 1050:
			case 1051:
			case 1052:
			case 1053:
			case 1054:
			case 1055:
				this.properties.mode.set(idx - 1050);
				this.size(true);
				window.Repaint();
				break;
			case 1075:
			case 1100:
			case 1150:
			case 1200:
			case 1250:
			case 1300:
				this.properties.px.set(idx - 1000);
				this.size(true);
				window.Repaint();
				break;
			case 1400:
			case 1405:
			case 1410:
			case 1420:
				this.properties.cycle.set(idx - 1400);
				break;
			case 1500:
			case 1501:
				this.properties.sort.set(idx - 1500);
				if (this.images.length > 1) {
					this.update();
				}
				break;
			case 1510:
			case 1511:
			case 1512:
			case 1513:
				this.properties.aspect.set(idx - 1510);
				window.Repaint();
				break;
			case 1520:
				this.set_default(this.files[this.image].split('\\').pop());
				break;
			case 1521:
				this.set_default('');
				break;
			case 1530:
				_.run(this.files[this.image]);
				break;
			case 1531:
				this.delete_image();
				break;
			case 1540:
				if (this.files.length) {
					_.explorer(this.files[this.image]);
				} else {
					_.run(this.folder);
				}
				break;
			}
		}
		
		this.key_down = function (k) {
			switch (k) {
			case VK_ESCAPE:
				if (this.properties.mode.value == 0 && this.overlay) { // grid
					this.enable_overlay(false);
				}
				break;
			case VK_LEFT:
			case VK_UP:
				this.wheel(1);
				break
			case VK_RIGHT:
			case VK_DOWN:
				this.wheel(-1);
				break;
			}
		}
		
		this.update = function () {
			this.image = 0;
			_.dispose.apply(null, this.images);
			this.files = _.getFiles(this.folder, this.exts, this.properties.sort.value == 1);
			if (this.properties.source.value == 1 && this.files.length > 1) {
				this.default_file = this.folder + utils.ReadINI(this.ini_file, 'Defaults', _.fbSanitise(this.artist));
				var tmp = _.indexOf(this.files, this.default_file);
				if (tmp > -1) {
					this.files.splice(tmp, 1);
					this.files.unshift(this.default_file);
				}
			}
			this.images = _.map(this.files, _.img);
			this.size(true);
			window.Repaint();
		}
		
		this.enable_overlay = function (b) {
			this.overlay = b;
			window.Repaint();
		}
		
		this.set_default = function (t) {
			utils.WriteINI(this.ini_file, 'Defaults', _.fbSanitise(this.artist), t);
			this.update();
		}
		
		this.delete_image = function () {
			_.recycleFile(this.files[this.image]);
			this.update();
		}
		
		this.download = function () {
			if (!_.tagged(this.artist)) {
				return;
			}
			var base = this.folder + _.fbSanitise(this.artist) + '_';
			this.xmlhttp.open('GET', 'https://www.last.fm/music/' + encodeURIComponent(this.artist) + '/+images', true);
			this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			this.xmlhttp.send();
			this.xmlhttp.onreadystatechange = _.bind(function () {
				if (this.xmlhttp.readyState == 4) {
					if (this.xmlhttp.status == 200) {
						this.success(base);
					} else {
						console.log(N, 'HTTP error:', this.xmlhttp.status);
					}
				}
			}, this);
		}
		
		this.success = function (base) {
			_(_.getElementsByTagName(this.xmlhttp.responseText, 'img'))
				.filter({className : 'image-list-image'})
				.take(this.properties.limit.value)
				.forEach(function (item) {
					var url = item.src.replace('avatar170s/', '');
					var filename = base + url.substring(url.lastIndexOf('/') + 1) + '.jpg';
					_.runCmd('cscript //nologo ' + _.q(this.vbs_file) + ' ' + _.q(url) + ' ' + _.q(filename), false);
				}, this)
				.value();
		}
		
		this.interval_func = _.bind(function () {
			this.time++;
			if (this.properties.cycle.value > 0 && this.images.length > 1 && this.time % this.properties.cycle.value == 0) {
				this.image++;
				if (this.image == this.images.length) {
					this.image = 0;
				}
				window.Repaint();
			}
			if (this.properties.source.value == 1 && this.time % 3 == 0 && _.getFiles(this.folder, this.exts).length != this.files.length) {
				this.update();
			}
		}, this);
		
		_.createFolder(folders.data);
		_.createFolder(folders.artists);
		this.mx = 0;
		this.my = 0;
		this.files = [];
		this.images = [];
		this.limits = [1, 3, 5, 10, 15, 20];
		this.modes = ['grid', 'left', 'right', 'top', 'bottom', 'off'];
		this.pxs = [75, 100, 150, 200, 250, 300];
		this.ini_file = folders.data + 'thumbs.ini';
		this.vbs_file = folders.home + 'vbs\\download.vbs';
		this.exts = 'jpg|jpeg|png|gif';
		this.folder = '';
		this.default_file = '';
		this.artist = '';
		this.img = null;
		this.nc = false;
		this.image = 0;
		this.image_xywh = [];
		this.index = 0;
		this.time = 0;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		this.properties = {
			mode : new _.p('2K3.THUMBS.MODE', 4), // 0 grid 1 left 2 right 3 top 4 bottom 5 off
			source : new _.p('2K3.THUMBS.SOURCE', 0), // 0 custom folder 1 last.fm
			tf : new _.p('2K3.THUMBS.CUSTOM.FOLDER.TF', '$directory_path(%path%)'),
			limit : new _.p('2K3.THUMBS.DOWNLOAD.LIMIT', 10),
			px : new _.p('2K3.THUMBS.PX', 75),
			cycle : new _.p('2K3.THUMBS.CYCLE', 0),
			sort : new _.p('2K3.THUMBS.SORT', 0), // 0 a-z 1 newest first
			aspect : new _.p('2K3.THUMBS.ASPECT', image.crop_top)
		};
		this.close_btn = new _.sb(guifx.close, 0, 0, _.scale(12), _.scale(12), _.bind(function () { return this.properties.mode.value == 0 && this.overlay; }, this), _.bind(function () { this.enable_overlay(false); }, this));
		window.SetInterval(this.interval_func, 1000);
	}
});
