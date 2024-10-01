// Constants
const API_URL = "https://biggamesapi.io/api/clan";
const BATTLE_TYPE = "CatchingBattle";
const UPDATE_INTERVAL_SECONDS = 110;
const WAIT_FOR_ZERO_SECONDS = true;
const ZERO_POINTS_THRESHOLD = 2;
const ZERO_POINTS_URL = "https://www.youtube.com/watch?v=i77QVCt0D4U";

// Data structure
const data = {
    labels: {
        start: "Start",
        time: "Time",
        huges: "Huges"
    },
    users: [
        { name: "Ash", id: 1524977286, clan: "fr3e", last_points: 0, current_points: 0, total_points_earned: 0, consecutive_zeros: 0 },
        { name: "Rocks", id: 1328450348, clan: "RFIL", last_points: 0, current_points: 0, total_points_earned: 0, consecutive_zeros: 0 },
    ]
};

// Global variables
let huge_suffix_count = 0;
let interval_count = 0;

function alignment_spaces(name, total_space = 8) {
    return ' '.repeat(total_space - name.length);
}

function alignment_spaces_for_points(current_points_str, max_points_length) {
    return ' '.repeat(max_points_length - current_points_str.length);
}

async function fetch_user_points(user) {
    const response = await fetch(`${API_URL}/${user.clan}`);
    return response.json();
}

function update_user_points(user, user_points) {
    user.total_points_earned += user_points - user.last_points;
    user.last_points = user.current_points;
    user.current_points = user_points;
}

function print_user_data(user, current_points_str, points_difference, max_points_length) {
    const spaces_name = alignment_spaces(user.name || 'Unknown');
    const spaces_points = alignment_spaces_for_points(current_points_str, max_points_length);
    
    let output = `${user.name}${spaces_name}: ${current_points_str}${spaces_points}`;
    if (points_difference) {
        output += ` (${points_difference})`;
    }
    console.log(output);
}

async function fetch_and_display_user_data() {
    let alert = "";

    const max_points_length = Math.max(...data.users.map(user => user.current_points.toLocaleString().length));

    for (const user of data.users) {
        const data_from_api = await fetch_user_points(user);

        await new Promise(resolve => setTimeout(resolve, 50));

        if ("data" in data_from_api && BATTLE_TYPE in data_from_api.data.Battles) {
            const battle_data = data_from_api.data.Battles[BATTLE_TYPE];
            const user_points = battle_data.PointContributions.find(item => item.UserID === user.id)?.Points;

            if (user_points === undefined) {
                console.log(`User ${user.name} not found in battle ${BATTLE_TYPE} for clan ${user.clan}`);
                continue;
            }

            if (user.last_points === 0) {
                user.last_points = user_points;
                user.current_points = user_points;
                
                const current_points_str = user_points.toLocaleString();
                print_user_data(user, current_points_str, "", max_points_length);
                continue;
            }
            
            update_user_points(user, user_points);

            if (user.current_points - user.last_points === 0) {
                user.consecutive_zeros += 1;
            } else {
                user.consecutive_zeros = 0;
            }

            if (user.consecutive_zeros >= ZERO_POINTS_THRESHOLD) {
                alert = `\n${user.name} has ${ZERO_POINTS_THRESHOLD} consecutive 0-point increases!\nOpening URL...\n`;
                console.log(`Opening URL: ${ZERO_POINTS_URL}`);
                user.consecutive_zeros = 0;
                await new Promise(resolve => setTimeout(resolve, 60000));
            }

            const points_difference = user.current_points - user.last_points;
            const huge_suffix = Math.abs(points_difference) > 250 ? " Huge!?" : "";
            if (huge_suffix) huge_suffix_count += 1;

            const current_points_str = user.current_points.toLocaleString();
            
            const points_difference_str = points_difference !== 0 ? `${points_difference >= 0 ? '+' : ''}${points_difference}${huge_suffix}` : "";
            
            print_user_data(user, current_points_str, points_difference_str, max_points_length);

        } else {
            console.log(`Battle ${BATTLE_TYPE} not found!`);
        }
    }

    const spaces_huges = alignment_spaces(data.labels.huges);
    console.log(`${data.labels.huges}${spaces_huges}: ${huge_suffix_count}`);

    if (alert) {
        console.log(alert);
    }
}

async function main() {
    console.log("\nFetching initial user data...\n");
    await fetch_and_display_user_data();

    const timestamp = new Date().toLocaleString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    console.log(`\n${data.labels.start}${alignment_spaces(data.labels.start)}: ${timestamp}`);

    try {
        while (true) {
            if (WAIT_FOR_ZERO_SECONDS) {
                while (new Date().getSeconds() !== 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            const timestamp = new Date().toLocaleString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            console.log(`\n${data.labels.time}${alignment_spaces(data.labels.time)}: ${timestamp}`);
            
            await fetch_and_display_user_data();
            interval_count += 1;
            await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL_SECONDS * 1000));
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("\n\nStopping points tracking.\n");
            for (const user of data.users) {
                const spaces = alignment_spaces(user.name);
                console.log(`${user.name}${spaces}: ${user.total_points_earned.toLocaleString()} points gained`);
            }

            const spaces_huges = alignment_spaces(data.labels.huges);
            console.log(`${data.labels.huges}${spaces_huges}: ${huge_suffix_count}`);
            
            console.log(`\nThe script ran for ${interval_count} intervals.\n`);
        } else {
            console.error("An error occurred:", error);
        }
    }
}

main();