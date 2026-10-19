const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('expo/config-plugins');

// A small, version-checked native extension until expo-audio exposes ICY titles.
// Reapplied by prebuild, including on EAS; no manual edits to generated Android files.
function replaceOnce(source, before, after, file) {
  if (source.split(before).length !== 2) {
    throw new Error(`Radio metadata: unexpected ${file}; review the expo-audio extension.`);
  }
  return source.replace(before, after);
}

function patchAudio(projectRoot) {
  const audioRoot = path.dirname(require.resolve('expo-audio/package.json', { paths: [projectRoot] }));
  const version = JSON.parse(fs.readFileSync(path.join(audioRoot, 'package.json'), 'utf8')).version;
  if (version !== '57.0.5') {
    throw new Error(`Radio metadata supports expo-audio 57.0.5, found ${version}. Review before upgrading.`);
  }
  const kotlinRoot = path.join(audioRoot, 'android/src/main/java/expo/modules/audio');
  const baseFile = path.join(kotlinRoot, 'BaseAudioPlayer.kt');
  let base = fs.readFileSync(baseFile, 'utf8').replace(/\r\n/g, '\n');
  if (!base.includes('// Radio Template: timed stream metadata')) {
    base = replaceOnce(base, '      override fun onPlayerError(error: PlaybackException) {',
      `      // Radio Template: timed stream metadata
      override fun onMetadata(metadata: androidx.media3.common.Metadata) {
        this@BaseAudioPlayer.onStreamMetadata(metadata)
      }

      override fun onPlayerError(error: PlaybackException) {`, 'BaseAudioPlayer.kt');
    base = replaceOnce(base, '  protected open fun onPlayerError(error: PlaybackException) {',
      `  protected open fun onStreamMetadata(metadata: androidx.media3.common.Metadata) = Unit

  protected open fun onPlayerError(error: PlaybackException) {`, 'BaseAudioPlayer.kt');
    fs.writeFileSync(baseFile, base);
  }

  const playerFile = path.join(kotlinRoot, 'AudioPlayer.kt');
  let player = fs.readFileSync(playerFile, 'utf8').replace(/\r\n/g, '\n');
  if (!player.includes('// Radio Template: expose ICY title')) {
    player = replaceOnce(player, '  var preservesPitch = true',
      `  // Radio Template: expose ICY title through the existing status event.
  private var radioStreamTitle: String? = null

  override fun onStreamMetadata(metadata: androidx.media3.common.Metadata) {
    for (index in 0 until metadata.length()) {
      val entry = metadata[index]
      if (entry is androidx.media3.extractor.metadata.icy.IcyInfo) {
        radioStreamTitle = entry.title?.trim()?.takeIf { it.isNotEmpty() }
        sendStatusUpdate()
      }
    }
  }

  var preservesPitch = true`, 'AudioPlayer.kt');
    player = replaceOnce(player, '  fun setMediaSource(source: MediaSource) {',
      '  fun setMediaSource(source: MediaSource) {\n    radioStreamTitle = null', 'AudioPlayer.kt');
    player = replaceOnce(player, '      "error" to null',
      '      "radioStreamTitle" to radioStreamTitle,\n      "error" to null', 'AudioPlayer.kt');
    fs.writeFileSync(playerFile, player);
  }
}

module.exports = function withRadioMetadata(config) {
  return withDangerousMod(config, ['android', async (mod) => {
    patchAudio(mod.modRequest.projectRoot);
    return mod;
  }]);
};
module.exports.patchAudio = patchAudio;
