function iconGridViz(option) {
	// Verify options
	if (!Number.isInteger(Math.sqrt(option.size))) {
		throw Error("Size of the icon grid needs to be a perfect square.");
	}
	if (option.num < 0) {
		throw Error("Numerator needs to be greater or equal to 0");
	}
	if (option.den && option.den <= 0) {
		throw Error("Denominator needs to be greater than 0.");
	}

	// Icon definitions
	const icons = {
		person:
			"M47.501,88.321c22.508,0,40.82-18.313,40.82-40.821S70.009,6.679,47.501,6.679c-22.51,0-40.822,18.313-40.822,40.821  S24.991,88.321,47.501,88.321z M47.501,83.59c-10.112,0-19.26-4.187-25.818-10.909c2.82-4.212,9.898-7.496,18.797-8.646  c-6.354-4.825-10.809-15.281-10.809-22.636c0-9.845,7.982-17.827,17.829-17.827s17.828,7.982,17.828,17.827  c0,7.354-4.451,17.811-10.809,22.636c8.9,1.149,15.978,4.435,18.799,8.646C66.76,79.403,57.612,83.59,47.501,83.59z",
		house:
			"m 50.1875,961.3673 a 2.0000666,1.9999522 0 0 1 1.125,0.46875 l 42,35.99998 a 2.0050221,2.0049075 0 0 1 -2.625,3.03127 L 50,965.9923 9.3125001,1000.8673 a 2.0050221,2.0049075 0 0 1 -2.625,-3.03127 L 25,982.14853 l 0,-16.78123 8,0 0,9.90625 15.6875,-13.4375 a 2.0000666,1.9999522 0 0 1 1.5,-0.46875 z m -0.1875,8 32,27.00003 0,46.99987 -64,0 0,-46.99987 32,-27.00003 z m 14,34 -12,0 0,11.9999 12,0 0,-11.9999 z m -16,0 -12,0 0,11.9999 12,0 0,-11.9999 z m 16,15.9999 -12,0 0,12 12,0 0,-12 z m -16,0 -12,0 0,12 12,0 0,-12 z",
		pill:
			"m 19.594409,1032.7678 c -7.02681,-7.0268 -7.02681,-18.4291 0,-25.4559 l 35.35534,-35.35532 c 7.02681,-7.02681 18.42903,-7.0268 25.45584,10e-6 7.026813,7.02681 7.026813,18.42904 0,25.45585 l -35.35534,35.35536 c -7.02681,7.0268 -18.42903,7.0268 -25.45584,0 z m 21.920309,-41.71933 19.79899,19.79903 16.26346,-16.2635 c 5.508771,-5.50877 5.50876,-14.2902 -9e-6,-19.79898 -5.508771,-5.50879 -14.29021,-5.50878 -19.798991,0 z m 25.98618,4.81717 c -0.61856,-0.77127 -0.5372,-2.01195 0.17678,-2.69585 l 2.82842,-2.82843 c 1.5724,-1.5724 2.53508,-3.22411 2.78423,-4.59619 0.24915,-1.37208 0.0133,-2.50577 -1.37001,-3.88909 -0.7577,-0.73662 -0.76738,-2.10133 -0.0202,-2.84857 0.74723,-0.74721 2.11197,-0.73757 2.84856,0.0201 2.142331,2.14233 2.932831,4.90268 2.474891,7.42462 -0.457961,2.52196 -1.93586,4.76429 -3.888841,6.71768 l -2.82844,2.82841 c -0.78499,0.81951 -2.29546,0.7529 -3.00519,-0.13258 z"
	};

	// Extract options
	const el = option.el;
	const size = option.size || 100;
	const denSpecified = option.den && option.num >= 1;
	const num = denSpecified
		? Math.round(option.num)
		: Math.round(option.num * size);
	const den = denSpecified ? Math.round(option.den) : size;
	const availableIcons = Object.keys(icons);
	const icon = availableIcons.includes(option.icon.toLowerCase())
		? option.icon.toLowerCase()
		: availableIcons[0];
	const back = option.back || "#c8c8c8";
	const fill = option.fill || "#119eb9";
	const titleLabel = option.lblTitle;
	const numLabel = option.lblNum;
	const denLabel = option.lblDen;

	const selectedIcon = icons[icon];

	// Set up
	const oneIconTransitionDuration = 100;
	const width = 640;
	const n = Math.sqrt(size);
	const bandScale = d3
		.scaleBand()
		.domain(d3.range(n))
		.range([0, width])
		.paddingInner(0.1)
		.paddingOuter(0.05);

	const container = d3.select(el).classed("icon-grid-viz", true);
	const svg = container
		.append("svg")
		.style("display", "block")
		.attr("viewBox", [0, 0, width, width])
		.on("mouseenter", showTooltip)
		.on("mousemove", moveTooltip)
		.on("mouseleave", hideTooltip);

	// Tooltip
	const tooltip = container
		.append("div")
		.attr("class", "chart-tooltip")
		.style("border-color", fill);
	tooltip
		.append("div")
		.attr("class", "title-label")
		.style("color", "#c8c8c8")
		.text(titleLabel);
	tooltip
		.append("div")
		.attr("class", "num-label")
		.style("color", fill)
		.text(`${numLabel}: ${num}`);
	tooltip
		.append("div")
		.attr("class", "den-label")
		.text(`${denLabel}: ${den}`);
	const {
		width: tooltipWidth,
		height: tooltipHeight
	} = tooltip.node().getBoundingClientRect();

	function showTooltip() {
		tooltip.transition().style("opacity", 1);
	}

	function hideTooltip() {
		tooltip.transition().style("opacity", 0);
	}

	function moveTooltip() {
		let padding = 10;
		let x = d3.event.clientX;
		if (x + padding + tooltipWidth > window.innerWidth) {
			x = x - padding - tooltipWidth;
		} else {
			x = x + padding;
		}
		let y = d3.event.clientY;
		if (y + padding + tooltipHeight > window.innerHeight) {
			y = y - padding - tooltipHeight;
		} else {
			y = y + padding;
		}
		tooltip.style("transform", `translate(${x}px,${y}px)`);
	}

	// Determine icon size
	const iconOriginal = svg.append("path").attr("d", selectedIcon);
	const iconBBox = iconOriginal.node().getBBox();
	iconOriginal.remove();
	const k = bandScale.bandwidth() / Math.max(iconBBox.width, iconBBox.height);
	const offset = Math.abs((iconBBox.width - iconBBox.height) / 2);
	const iconTransform =
		iconBBox.width < iconBBox.height
			? `translate(${-iconBBox.x * k + offset * k},${-iconBBox.y *
					k})scale(${k})`
			: `translate(${-iconBBox.x * k},${-iconBBox.y * k +
					offset * k})scale(${k})`;

	// Defs
	const defs = svg.append("defs");
	const idPrefix = `icon-grid-viz-${Date.now()}`;
	const iconId = `${idPrefix}-icon`;
	defs
		.append("path")
		.attr("id", iconId)
		.attr("d", selectedIcon)
		.attr("transform", iconTransform);
	const gradientIds = d3.range(num).map(i => `${idPrefix}-gradient-${i}`);
	const gradient = defs
		.selectAll("linearGradient")
		.data(gradientIds)
		.join("linearGradient")
		.attr("id", d => d);
	gradient
		.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", fill);
	gradient
		.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", back);

	// Background
	svg
		.append("g")
		.attr("fill", back)
		.selectAll("use")
		.data(d3.range(size))
		.join("use")
		.attr("transform", d => {
			const p = getGridPosition(d);
			return `translate(${bandScale(p[0])},${bandScale(p[1])})`;
		})
		.attr("href", `#${iconId}`);

	// Foreground
	svg
		.append("g")
		.selectAll("use")
		.data(gradientIds)
		.join("use")
		.attr("transform", (d, i) => {
			const p = getGridPosition(i);
			return `translate(${bandScale(p[0])},${bandScale(p[1])})`;
		})
		.attr("href", `#${iconId}`)
		.attr("fill", d => `url(#${d})`);

	// Animate
	gradient
		.transition()
		.ease(d3.easeLinear)
		.duration(oneIconTransitionDuration)
		.delay((d, i) => i * oneIconTransitionDuration)
		.selectAll("stop")
		.attr("offset", "100%");

	function getGridPosition(d) {
		return [d % n, Math.floor(d / n)];
	}
}
