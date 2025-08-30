<script>
    import lenry0 from "$lib/assets/secretLenry_pixelated.png";
    import lenry1 from "$lib/assets/secretLenry_pixelated1.png";
    import lenry2 from "$lib/assets/secretLenry_pixelated2.png";

    const images = [lenry0, lenry1, lenry2];

    const im1prob = 0.11; // probability of changing to E
    const im2prob = 0.05; // probability of changing to CRET
    const flickerInterval = 152; // milliseconds

    let currentImage = images[0];

    setInterval(() => {
        if (Math.random() < im1prob){
            currentImage = images[1];
        } else if (Math.random() < im2prob){
            currentImage = images[2];
        } else {
            currentImage = images[0];
        }
    }, flickerInterval);
</script>

<div class = "centered">
    <a href="/game">
        <img src={currentImage} alt='secret lenry'/>
    </a>
</div>

<style>
    .centered {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>